<script lang="ts">
import { onMount, type Snippet } from "svelte"
import { provideBentoRegistry } from "$lib/bento/bento-registry.svelte"
import { computeGazePoint } from "$lib/layout/gaze"
import { anneal } from "$lib/bento/annealer"
import { defaultAnnealConfig } from "$lib/bento/anneal-config"
import { costFn } from "$lib/bento/cost"
import { DEFAULT_WEIGHTS } from "$lib/bento/cost-weights"
import { lpSolve } from "$lib/bento/lp-solver"
import { SequencePair } from "$lib/bento/sequence-pair"
import BentoWorker from "$lib/bento/pack.worker?worker"
import type {
  AdjacencyHint,
  GazePoint,
  PackRequest,
  TileMeta,
  Viewport,
  WorkerMessageOut,
} from "$lib/bento/types"

type Props = {
  children: Snippet
  adjacency?: AdjacencyHint[]
  gutter?: number
  mobileBreakpoint?: number
  animate?: boolean
}

let {
  children,
  adjacency = [],
  gutter = 12,
  mobileBreakpoint = 720,
  animate = true,
}: Props = $props()

const DEFAULT_VIEWPORT: Viewport = { w: 1280, h: 720 }
const DEFAULT_GAZE: GazePoint = { x: 640, y: 274 }
const WORKER_IDLE_MS = 30_000
const ANNEAL_DEBOUNCE_MS = 250

const registry = provideBentoRegistry()

let viewport = $state<Viewport>(DEFAULT_VIEWPORT)
let gaze = $state<GazePoint>(DEFAULT_GAZE)
let ready = $state(false)
let prefersReducedMotion = $state(false)

let containerEl = $state<HTMLDivElement | undefined>()
let debug = $state(false)
let debugBreakdown = $state<Record<string, number> | null>(null)
let worker: Worker | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null
let annealTimer: ReturnType<typeof setTimeout> | null = null
let rafScheduled = false
let lastVersion = -1
let lastRequestId = 0
let resizeObserver: ResizeObserver | null = null
let currentSp: SequencePair | null = null

function snapshotTiles(): TileMeta[] {
  // $state.snapshot strips Svelte 5 reactive proxies so the result is
  // structured-cloneable for postMessage to the worker.
  return registry.list().map((entry) => ({
    id: entry.id,
    priority: entry.priority,
    minW: entry.minW,
    minH: entry.minH,
    aspectRatio: entry.aspectRatio ? $state.snapshot(entry.aspectRatio) : undefined,
    cluster: entry.cluster,
    clusterOrder: entry.clusterOrder,
    placement: entry.placement,
  }))
}

function buildRequest(): PackRequest {
  return {
    viewport: { w: viewport.w, h: viewport.h },
    gaze: { x: gaze.x, y: gaze.y },
    gutter,
    tiles: snapshotTiles(),
    adjacency: adjacency.map((h) => ({ a: h.a, b: h.b, weight: h.weight })),
  }
}

function ensureWorker(): Worker | null {
  if (typeof window === "undefined") return null
  if (worker) return worker
  try {
    worker = new BentoWorker()
    worker.onmessage = (e: MessageEvent<WorkerMessageOut>) => handleWorkerMessage(e.data)
    worker.onerror = (err) => console.warn("bento worker error", err)
  } catch (err) {
    console.warn("bento worker init failed; using main-thread fallback", err)
    worker = null
  }
  return worker
}

function scheduleWorkerIdle(): void {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    if (worker) {
      worker.terminate()
      worker = null
    }
  }, WORKER_IDLE_MS)
}

function handleWorkerMessage(msg: WorkerMessageOut): void {
  if (msg.requestId !== lastRequestId) return // stale
  if (msg.kind === "annealed") {
    currentSp = SequencePair.fromData(msg.sp)
    registry.applyPositions(msg.positions, msg.totalHeight)
    ready = true
    if (debug) updateDebugBreakdown()
    scheduleWorkerIdle()
  } else if (msg.kind === "relaxed") {
    registry.applyPositions(msg.positions, msg.totalHeight)
    ready = true
    if (debug) updateDebugBreakdown()
  }
}

function updateDebugBreakdown(): void {
  if (!currentSp) return
  const tiles = snapshotTiles()
  const positions = Object.values(registry.positions)
  if (positions.length === 0) return
  const r = costFn(
    {
      positions,
      tiles,
      sp: currentSp,
      adjacency: adjacency.map((h) => ({ a: h.a, b: h.b, weight: h.weight })),
      viewport: { w: viewport.w, h: viewport.h },
      gaze: { x: gaze.x, y: gaze.y },
    },
    DEFAULT_WEIGHTS
  )
  debugBreakdown = { total: r.total, ...r.breakdown }
}

function runLPOnMainThread(): void {
  if (!currentSp) {
    // No SP yet → can't LP. Will get one from the next anneal.
    return
  }
  const tiles = snapshotTiles()
  const r = lpSolve(currentSp, tiles, viewport, gutter)
  registry.applyPositions(r.positions, r.totalHeight)
  ready = true
}

function requestAnneal(): void {
  if (annealTimer) clearTimeout(annealTimer)
  annealTimer = setTimeout(() => {
    annealTimer = null
    const w = ensureWorker()
    const requestId = ++lastRequestId
    if (w) {
      w.postMessage({ kind: "anneal", requestId, request: buildRequest() })
    } else {
      // Worker-spawn failed (rare). Run synchronously on the main thread.
      const cfg = defaultAnnealConfig(requestId)
      const result = anneal(
        snapshotTiles(),
        adjacency.map((h) => ({ a: h.a, b: h.b, weight: h.weight })),
        { w: viewport.w, h: viewport.h },
        { x: gaze.x, y: gaze.y },
        gutter,
        DEFAULT_WEIGHTS,
        cfg
      )
      if (requestId !== lastRequestId) return
      currentSp = result.sp
      registry.applyPositions(result.positions, result.totalHeight)
      ready = true
      if (debug) updateDebugBreakdown()
    }
  }, ANNEAL_DEBOUNCE_MS)
}

function schedulePack(reset: boolean): void {
  if (rafScheduled) return
  rafScheduled = true
  const fn = () => {
    rafScheduled = false
    if (viewport.w < mobileBreakpoint) {
      registry.setMode("boring")
      ready = true
      return
    }
    registry.setMode("pack")
    if (reset || !currentSp) {
      // No topology yet — trigger an anneal.
      requestAnneal()
    } else {
      // Fast path: re-LP on main thread with the current SP.
      runLPOnMainThread()
      // Also kick a debounced re-anneal in case the LP indicates topology drift.
      requestAnneal()
    }
  }
  if (typeof requestAnimationFrame === "undefined") fn()
  else requestAnimationFrame(fn)
}

function refreshViewport(): void {
  if (typeof window === "undefined") return
  const el = containerEl
  const w = el?.clientWidth ?? window.innerWidth
  viewport = { w, h: window.innerHeight }
  gaze = computeGazePoint(window)
  registry.setViewport(viewport)
}

onMount(() => {
  refreshViewport()
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search)
    debug = params.get("debug") === "1"
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    prefersReducedMotion = motion.matches
    motion.addEventListener("change", (e) => {
      prefersReducedMotion = e.matches
    })
    if (containerEl && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        refreshViewport()
        schedulePack(false)
      })
      resizeObserver.observe(containerEl)
    } else {
      window.addEventListener("resize", () => {
        refreshViewport()
        schedulePack(false)
      })
    }
  }
  schedulePack(true)
  return () => {
    if (resizeObserver) resizeObserver.disconnect()
    if (idleTimer) clearTimeout(idleTimer)
    if (annealTimer) clearTimeout(annealTimer)
    if (worker) {
      worker.terminate()
      worker = null
    }
  }
})

$effect(() => {
  const v = registry.version
  if (v === lastVersion) return
  lastVersion = v
  if (registry.list().length === 0) return
  schedulePack(true)
})

const animateAttr = $derived(ready && animate && !prefersReducedMotion ? "on" : "off")
const containerStyle = $derived.by(() => {
  if (registry.mode === "boring") return ""
  if (registry.wallHeight > 0) return `height: ${registry.wallHeight}px`
  return ""
})
</script>

<div
  bind:this={containerEl}
  class="bento-container"
  data-mode={registry.mode}
  data-animate={animateAttr}
  data-ready={ready ? "yes" : "no"}
  style="--bento-gutter: {gutter}px; {containerStyle}"
>
  {@render children()}
</div>

{#if debug && debugBreakdown}
  <aside class="bento-debug" aria-label="cost breakdown">
    <strong>cost breakdown</strong>
    {#each Object.entries(debugBreakdown) as [key, val] (key)}
      <div class:debug-total={key === "total"}>
        <span>{key}</span>
        <span>{val.toFixed(2)}</span>
      </div>
    {/each}
  </aside>
{/if}

<style>
.bento-container {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-primary);
}

.bento-container[data-mode="boring"] {
  position: static;
  display: flex;
  flex-direction: column;
  gap: var(--bento-gutter, 12px);
  padding: var(--bento-gutter, 12px);
}

.bento-container[data-mode="boring"] :global(.bento-tile) {
  position: static !important;
  transform: none !important;
  width: 100% !important;
  height: auto !important;
}

.bento-container[data-ready="no"] :global(.bento-tile) {
  visibility: hidden;
}

.bento-container[data-animate="on"] :global(.bento-tile) {
  transition:
    transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    width 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
    height 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.bento-debug {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  color: #e5e7eb;
  font-family: "Space Mono", monospace;
  font-size: 0.7rem;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #374151;
  min-width: 180px;
  pointer-events: none;
}

.bento-debug strong {
  display: block;
  color: var(--accent);
  margin-bottom: 0.35rem;
  font-size: 0.7rem;
}

.bento-debug div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.bento-debug .debug-total {
  border-top: 1px solid #374151;
  margin-top: 0.25rem;
  padding-top: 0.25rem;
  color: var(--accent);
  font-weight: 700;
}
</style>
