<script lang="ts">
import { onMount, type Snippet } from "svelte"
import { provideBentoRegistry } from "$lib/bento/bento-registry.svelte"
import { constructivePack } from "$lib/bento/constructive"
import type { AdjacencyHint, Position, TileMeta, Viewport } from "$lib/bento/types"

type Props = {
  children: Snippet
  /** Kept for API compatibility; the constructive packer uses clusters + reading
   *  order rather than pairwise adjacency hints. */
  adjacency?: AdjacencyHint[]
  gutter?: number
  mobileBreakpoint?: number
  /** Cap the packing width; beyond it the wall is centred. */
  maxWidth?: number
}

let {
  children,
  adjacency: _adjacency = [],
  gutter = 12,
  mobileBreakpoint = 720,
  maxWidth = 2200,
}: Props = $props()

const DEFAULT_VIEWPORT: Viewport = { w: 1280, h: 720 }
const RESIZE_DEBOUNCE_MS = 160
// Width comes from window.innerWidth (scrollbar-state-independent) minus a fixed
// scrollbar reserve — NOT clientWidth (which shrinks when the scrollbar appears).
// This keeps the compute width identical whether or not the scrollbar is present,
// so the layout is deterministic regardless of load path.
const SCROLLBAR_RESERVE = 16
// A scrollbar appearing changes the width ~15px; never recompute on that (it
// could collapse the wall / break scroll). Only react to real resizes.
const WIDTH_CHANGE_THRESHOLD = 24
// Viewport-independent content-measure caps → measurements are path-invariant.
const MAX_TILE_W = 1100
const MAX_TILE_H = 1400

const registry = provideBentoRegistry()

// Lifecycle: gather → measure → pack (synchronous, fast) → reveal. `revealed`
// latches true on the first finished layout; before it, tiles are display:none
// so the first paint never animates from a stale position.
let revealed = $state(false)

let viewport = $state<Viewport>(DEFAULT_VIEWPORT)
// Full available width (≥ viewport.w). Used to centre the wall on huge screens.
let availableWidth = $state(DEFAULT_VIEWPORT.w)

let containerEl = $state<HTMLDivElement | undefined>()
let debug = $state(false)
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let resizeObserver: ResizeObserver | null = null
let measuredVersion = -1
let fontsReady = false
let startedOnce = false
let computeToken = 0
let lastVersion = -1
let lastObservedWidth = -1

function snapshotTiles(): TileMeta[] {
  return registry.list().map((entry) => ({
    id: entry.id,
    priority: entry.priority,
    minW: entry.minW,
    minH: entry.minH,
    prefW: entry.prefW,
    prefH: entry.prefH,
    maxW: entry.maxW,
    maxH: entry.maxH,
    aspectRatio: entry.aspectRatio ? $state.snapshot(entry.aspectRatio) : undefined,
    cluster: entry.cluster,
    clusterOrder: entry.clusterOrder,
    placement: entry.placement,
  }))
}

/**
 * Measure each tile's intrinsic content box (min-content width, and a balanced
 * "preferred" width). VIEWPORT-INDEPENDENT (fixed caps), run ONCE — so the
 * packer's column-span decisions are path-invariant. Heights are NOT taken here;
 * the packer measures them at the exact width each tile is assigned.
 */
function measureTiles(): void {
  if (typeof document === "undefined" || !fontsReady) return
  for (const entry of registry.list()) {
    const el = entry.el
    if (!el) continue
    const prev = el.getAttribute("style") ?? ""
    el.style.cssText =
      "position:absolute;left:-99999px;top:0;height:auto;max-width:none;display:block;visibility:hidden;box-sizing:border-box;"

    let minW = entry.minW
    el.style.width = "min-content"
    minW = Math.min(Math.max(entry.minW, el.offsetWidth + 4), Math.max(entry.minW, MAX_TILE_W))
    el.style.width = `${minW}px`
    const hNarrow = el.offsetHeight + 1
    const ideal = entry.aspectRatio?.ideal ?? 1
    const balanced = Math.round(Math.sqrt(minW * hNarrow * ideal))
    const prefW = Math.min(Math.max(balanced, minW), Math.max(minW, MAX_TILE_W))

    el.setAttribute("style", prev)
    // prefH/maxW/maxH unused by the constructive packer; carry pref as a sane value.
    registry.applyMeasured(entry.id, minW, entry.minH, prefW, hNarrow, prefW, hNarrow)
    if (debug) {
      // biome-ignore lint/suspicious/noExplicitAny: measurement inspection in ?debug=1
      const dbg = ((window as any).__bentoMeasured ??= {})
      dbg[entry.id] = { minW, prefW }
    }
  }
  measuredVersion = registry.version
}

/** DOM-measured content height of a tile rendered at `width` px. */
function measureContentHeight(id: string, width: number): number {
  if (typeof document === "undefined") return registry.tiles[id]?.minH ?? 120
  const el = registry.tiles[id]?.el
  if (!el) return registry.tiles[id]?.minH ?? 120
  const prev = el.getAttribute("style") ?? ""
  el.style.cssText =
    "position:absolute;left:-99999px;top:0;height:auto;max-width:none;display:block;visibility:hidden;box-sizing:border-box;"
  el.style.width = `${Math.round(width)}px`
  const h = el.offsetHeight + 1
  el.setAttribute("style", prev)
  return Math.max(40, Math.min(h, MAX_TILE_H))
}

/** Centre the wall horizontally when filled content is narrower than the screen. */
function centerPositions(positions: Position[]): Position[] {
  if (positions.length === 0) return positions
  const usedRight = Math.max(...positions.map((p) => p.x + p.w))
  const slack = availableWidth - (usedRight + gutter)
  if (slack <= 1) return positions
  const dx = Math.round(slack / 2)
  return positions.map((p) => ({ ...p, x: p.x + dx }))
}

function refreshViewport(): void {
  if (typeof window === "undefined") return
  const avail = Math.max(320, window.innerWidth - SCROLLBAR_RESERVE)
  availableWidth = avail
  viewport = { w: Math.min(avail, maxWidth), h: window.innerHeight }
  registry.setViewport(viewport)
}

/** The single entry point: compute and reveal the layout for the current width. */
function recompute(): void {
  if (typeof window === "undefined") return
  refreshViewport()

  if (viewport.w < mobileBreakpoint) {
    registry.setMode("boring")
    revealed = true
    return
  }

  registry.setMode("pack")
  if (registry.version !== measuredVersion) measureTiles()

  const token = ++computeToken
  const tiles = snapshotTiles()
  const { positions, totalHeight } = constructivePack({
    tiles,
    viewport: { w: viewport.w, h: viewport.h },
    gutter,
    contentHeight: measureContentHeight,
  })
  applyComputed(token, centerPositions(positions), totalHeight)
}

function applyComputed(token: number, positions: Position[], totalHeight: number): void {
  if (token !== computeToken) return
  registry.applyPositions(positions, totalHeight)
  if (revealed) return // already visible (resize): swap in place
  // First reveal: positions are now in the DOM while tiles are display:none, so
  // flipping to display:block on the next frame shows them in place — no slide.
  if (typeof requestAnimationFrame === "undefined") {
    revealed = true
    return
  }
  requestAnimationFrame(() => {
    if (token === computeToken) revealed = true
  })
}

function scheduleRecompute(delay: number): void {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    resizeTimer = null
    recompute()
  }, delay)
}

onMount(() => {
  refreshViewport()
  lastObservedWidth = typeof window !== "undefined" ? window.innerWidth : availableWidth

  if (typeof window !== "undefined") {
    debug = new URLSearchParams(window.location.search).get("debug") === "1"

    const onWidthChange = () => {
      if (!startedOnce) return
      const w = window.innerWidth // scrollbar-independent
      if (Math.abs(w - lastObservedWidth) < WIDTH_CHANGE_THRESHOLD) return
      lastObservedWidth = w
      scheduleRecompute(RESIZE_DEBOUNCE_MS)
    }
    if (containerEl && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(onWidthChange)
      resizeObserver.observe(containerEl)
    } else {
      window.addEventListener("resize", onWidthChange)
    }
  }

  // Measure after fonts load (glyph metrics drive measurement). The fallback
  // computes provisionally if the font hangs; when the font loads we re-measure
  // and recompute so the layout is correct AND identical to a later cached load.
  const fonts = typeof document !== "undefined" ? document.fonts : undefined
  const start = () => {
    if (startedOnce) return
    startedOnce = true
    fontsReady = true
    lastVersion = registry.version
    recompute()
  }
  if (fonts && fonts.status !== "loaded") {
    fonts.ready.then(() => {
      fontsReady = true
      if (startedOnce) {
        measuredVersion = -1
        scheduleRecompute(0)
      } else start()
    })
    setTimeout(start, 600)
  } else {
    start()
  }

  return () => {
    if (resizeObserver) resizeObserver.disconnect()
    if (resizeTimer) clearTimeout(resizeTimer)
  }
})

// Tile-set changes (after first compute) → re-measure + recompute.
$effect(() => {
  const v = registry.version
  if (v === lastVersion) return
  lastVersion = v
  if (!startedOnce || registry.list().length === 0) return
  measuredVersion = -1
  scheduleRecompute(0)
})

const containerStyle = $derived.by(() => {
  if (registry.mode === "boring") return ""
  if (revealed && registry.wallHeight > 0) return `height: ${registry.wallHeight}px`
  return ""
})
</script>

<div
  bind:this={containerEl}
  class="bento-container"
  data-mode={registry.mode}
  data-ready={revealed ? "yes" : "no"}
  style="--bento-gutter: {gutter}px; {containerStyle}"
>
  {@render children()}

  {#if !revealed}
    <div class="bento-loading" role="status" aria-label="Loading layout">
      <div class="spinner" aria-hidden="true"></div>
    </div>
  {/if}
</div>

<style>
.bento-container {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-primary);
}

/* Before reveal: reserve space for the spinner and hide the (unpositioned)
   tiles. display:none means the first reveal never runs a transition. */
.bento-container[data-ready="no"] {
  min-height: 75vh;
}

.bento-container[data-ready="no"] :global(.bento-tile) {
  display: none;
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

.bento-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 38px;
  height: 38px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: bento-spin 0.8s linear infinite;
}

@keyframes bento-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 1.6s;
  }
}
</style>
