import { getContext, setContext } from "svelte"
import type { AspectBand, Placement, Position, Tier, Viewport } from "./types"

export interface BentoTileEntry {
  id: string
  priority: Tier
  minW: number
  minH: number
  aspectRatio?: AspectBand
  cluster?: string
  clusterOrder?: number
  placement?: Placement
  el: HTMLElement | null
}

export type LayoutMode = "measuring" | "pack" | "boring"

const CONTEXT_KEY = Symbol("bento-registry")

export class BentoRegistry {
  tiles = $state<Record<string, BentoTileEntry>>({})
  positions = $state<Record<string, Position>>({})
  mode = $state<LayoutMode>("measuring")
  wallHeight = $state(0)
  viewport = $state<Viewport>({ w: 1280, h: 720 })
  version = $state(0)

  register(entry: BentoTileEntry): void {
    this.tiles[entry.id] = entry
    this.version++
  }

  unregister(id: string): void {
    if (!(id in this.tiles)) return
    delete this.tiles[id]
    delete this.positions[id]
    this.version++
  }

  applyPositions(positions: Position[], wallHeight: number): void {
    const next: Record<string, Position> = {}
    for (const p of positions) next[p.id] = p
    this.positions = next
    this.wallHeight = wallHeight
  }

  setMode(mode: LayoutMode): void {
    this.mode = mode
  }

  setViewport(v: Viewport): void {
    this.viewport = v
  }

  list(): BentoTileEntry[] {
    return Object.values(this.tiles)
  }
}

export function provideBentoRegistry(): BentoRegistry {
  const registry = new BentoRegistry()
  setContext(CONTEXT_KEY, registry)
  return registry
}

export function useBentoRegistry(): BentoRegistry {
  const registry = getContext<BentoRegistry | undefined>(CONTEXT_KEY)
  if (!registry) {
    throw new Error("useBentoRegistry() must be called inside a <BentoLayout> component")
  }
  return registry
}
