import { getContext, setContext } from "svelte"
import type { Position } from "./types"

export type TileEntry = {
  id: string
  priority: number
  minWidth: number
  minHeight: number
  el: HTMLElement | null
}

export type LayoutMode = "measuring" | "pack" | "boring"

const CONTEXT_KEY = Symbol("masonry-registry")

export class MasonryRegistry {
  tiles = $state<Record<string, TileEntry>>({})
  positions = $state<Record<string, Position>>({})
  mode = $state<LayoutMode>("measuring")
  version = $state(0)
  probeWidth = $state(420)

  setProbeWidth(width: number): void {
    this.probeWidth = width
  }

  register(entry: TileEntry): void {
    this.tiles[entry.id] = entry
    this.version++
  }

  updatePriority(id: string, priority: number): void {
    const current = this.tiles[id]
    if (!current || current.priority === priority) return
    this.tiles[id] = { ...current, priority }
    this.version++
  }

  unregister(id: string): void {
    if (!(id in this.tiles)) return
    delete this.tiles[id]
    delete this.positions[id]
    this.version++
  }

  setPositions(positions: Position[], mode: LayoutMode): void {
    const next: Record<string, Position> = {}
    for (const p of positions) next[p.id] = p
    this.positions = next
    this.mode = mode
  }

  list(): TileEntry[] {
    return Object.values(this.tiles)
  }
}

export function provideRegistry(): MasonryRegistry {
  const registry = new MasonryRegistry()
  setContext(CONTEXT_KEY, registry)
  return registry
}

export function useRegistry(): MasonryRegistry {
  const registry = getContext<MasonryRegistry | undefined>(CONTEXT_KEY)
  if (!registry) {
    throw new Error("useRegistry() must be called inside a <MasonryLayout> component")
  }
  return registry
}
