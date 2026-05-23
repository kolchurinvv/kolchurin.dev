<script lang="ts">
import { onMount, type Snippet } from "svelte"
import { provideRegistry } from "$lib/layout/registry.svelte"
import { computeGazePoint } from "$lib/layout/gaze"
import { packAnchored } from "$lib/layout/pack"
import PackWorker from "$lib/layout/pack.worker?worker"
import type {
  AnchorSize,
  GazePoint,
  PackRequest,
  PackResponse,
  Position,
  StripLabel,
  TileMeta,
  Viewport,
} from "$lib/layout/types"

type Props = {
  children: Snippet
  gutter?: number
  animate?: boolean
  /** Tile id to anchor at the gaze point. Defaults to highest-priority tile. */
  anchor?: string
  /** Explicit anchor size; skips weight-based sizing. */
  anchorSize?: AnchorSize
}

let { children, gutter = 16, animate = true, anchor, anchorSize }: Props = $props()

const MAX_ITERATIONS = 3
const RESIZE_DEBOUNCE_MS = 120
const WORKER_IDLE_MS = 30_000
const OVERFLOW_CHECK_DELAY_MS = 360
const BORING_FALLBACK_TILE_RATIO = 0.5
const DEFAULT_VIEWPORT: Viewport = { w: 1280, h: 720 }
const DEFAULT_GAZE: GazePoint = { x: 640, y: 274 }

const registry = provideRegistry()

let viewport = $state<Viewport>(DEFAULT_VIEWPORT)
let gaze = $state<GazePoint>(DEFAULT_GAZE)
let ready = $state(false)

let worker: Worker | null = null
let iteration = 0
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null
let packScheduled = false
let lastVersion = -1
let prefersReducedMotion = false

let lastAssignment: Record<string, StripLabel> | null = null
let bestPositions: Position[] | null = null
let bestOverflowCount = Number.POSITIVE_INFINITY
let bestOverflowMagnitude = Number.POSITIVE_INFINITY

function snapshotTiles(overflowing: { id: string; requiredH: number }[]): TileMeta[] {
  const overflowMap = new Map(overflowing.map((o) => [o.id, o.requiredH]))
  return registry.list().map((entry) => {
    const el = entry.el
    const w = el ? Math.max(el.scrollWidth, entry.minWidth) : entry.minWidth
    const h = el ? Math.max(el.scrollHeight, entry.minHeight) : entry.minHeight
    const requiredH = overflowMap.get(entry.id)
    const tile: TileMeta = {
      id: entry.id,
      priority: entry.priority,
      minW: entry.minWidth,
      minH: entry.minHeight,
      naturalW: w,
      naturalH: h,
    }
    if (requiredH != null) tile.requiredH = requiredH
    return tile
  })
}

function ensureWorker(): Worker | null {
  if (typeof window === "undefined") return null
  if (worker) return worker
  try {
    worker = new PackWorker()
    worker.onmessage = (e: MessageEvent<PackResponse>) => handleResponse(e.data)
    worker.onerror = (err) => {
      console.warn("masonry worker error", err)
    }
  } catch (err) {
    console.warn("masonry worker init failed, using main thread", err)
    worker = null
  }
  return worker
}

function scheduleIdle(): void {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    if (worker) {
      worker.terminate()
      worker = null
    }
  }, WORKER_IDLE_MS)
}

function resetBest(): void {
  bestPositions = null
  bestOverflowCount = Number.POSITIVE_INFINITY
  bestOverflowMagnitude = Number.POSITIVE_INFINITY
  lastAssignment = null
}

function handleResponse(response: PackResponse): void {
  if (response.mode === "boring") {
    registry.setPositions([], "boring")
    ready = true
    return
  }
  lastAssignment = response.assignment
  registry.setPositions(response.positions, "pack")
  if (typeof window === "undefined") {
    ready = true
    return
  }
  if (!ready) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ready = true
      })
    })
  }
  setTimeout(checkOverflow, OVERFLOW_CHECK_DELAY_MS)
}

function requestPack(overflowing: { id: string; requiredH: number }[]): void {
  const tiles = snapshotTiles(overflowing)
  if (tiles.length === 0) return
  const request: PackRequest = {
    viewport: { w: viewport.w, h: viewport.h },
    gaze: { x: gaze.x, y: gaze.y },
    gutter,
    tiles,
    overflowingIds: overflowing.map((o) => o.id),
  }
  if (anchor) request.anchorId = anchor
  if (anchorSize) request.anchorSize = { w: anchorSize.w, h: anchorSize.h }
  if (iteration > 0 && lastAssignment) {
    request.pinnedAssignment = { ...lastAssignment }
  }

  const w = ensureWorker()
  if (w) {
    w.postMessage(request)
    scheduleIdle()
  } else {
    handleResponse(packAnchored(request))
  }
}

function applyBestOrBoring(): void {
  const tileCount = registry.list().length
  if (tileCount === 0) return
  const threshold = tileCount * BORING_FALLBACK_TILE_RATIO
  if (bestOverflowCount > threshold) {
    registry.setPositions([], "boring")
    return
  }
  if (bestPositions) {
    registry.setPositions(bestPositions, "pack")
  }
}

function checkOverflow(): void {
  if (registry.mode !== "pack") return
  const overflowing: { id: string; requiredH: number }[] = []
  let overflowMagnitude = 0
  for (const entry of registry.list()) {
    const el = entry.el
    if (!el) continue
    const overflow = el.scrollHeight - el.clientHeight
    if (overflow > 1) {
      overflowing.push({ id: entry.id, requiredH: el.scrollHeight })
      overflowMagnitude += overflow
    }
  }

  const currentCount = overflowing.length
  const isImprovement =
    currentCount < bestOverflowCount ||
    (currentCount === bestOverflowCount && overflowMagnitude < bestOverflowMagnitude)
  if (isImprovement) {
    bestPositions = Object.values(registry.positions).map((p) => ({ ...p }))
    bestOverflowCount = currentCount
    bestOverflowMagnitude = overflowMagnitude
  }

  if (currentCount === 0) return
  iteration++
  if (iteration >= MAX_ITERATIONS) {
    applyBestOrBoring()
    return
  }
  if (!isImprovement) {
    // Iteration regressed; revert and stop.
    applyBestOrBoring()
    return
  }
  requestPack(overflowing)
}

function schedulePack(reset: boolean): void {
  if (packScheduled) return
  packScheduled = true
  queueMicrotask(() => {
    packScheduled = false
    if (reset) {
      iteration = 0
      resetBest()
    }
    requestPack([])
  })
}

function refreshViewport(): void {
  if (typeof window === "undefined") return
  viewport = { w: window.innerWidth, h: window.innerHeight }
  gaze = computeGazePoint(window)
  registry.setProbeWidth(Math.max(280, Math.min(520, viewport.w / 4)))
}

function onResize(): void {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    refreshViewport()
    schedulePack(true)
  }, RESIZE_DEBOUNCE_MS)
}

onMount(() => {
  refreshViewport()
  if (typeof window !== "undefined") {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    prefersReducedMotion = motionQuery.matches
    motionQuery.addEventListener("change", (e) => {
      prefersReducedMotion = e.matches
    })
    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onResize)
  }
  schedulePack(true)
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onResize)
    }
    if (resizeTimer) clearTimeout(resizeTimer)
    if (idleTimer) clearTimeout(idleTimer)
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
</script>

<div
  class="masonry-container"
  data-mode={registry.mode}
  data-animate={animateAttr}
  data-ready={ready ? "yes" : "no"}
  style="--masonry-gutter: {gutter}px;"
>
  {@render children()}
</div>

<style>
.masonry-container {
  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  background: var(--bg-primary);
}

.masonry-container[data-mode="boring"] {
  position: static;
  width: 100%;
  height: auto;
  min-height: 100dvh;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: var(--masonry-gutter, 16px);
  padding: var(--masonry-gutter, 16px);
}

.masonry-container[data-mode="boring"] :global(.masonry-tile) {
  position: relative !important;
  transform: none !important;
  width: 100% !important;
  height: auto !important;
  visibility: visible !important;
}

.masonry-container[data-ready="no"] :global(.masonry-tile) {
  visibility: hidden;
}

.masonry-container[data-animate="on"] :global(.masonry-tile) {
  transition:
    transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1),
    width 280ms cubic-bezier(0.2, 0.8, 0.2, 1),
    height 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
</style>
