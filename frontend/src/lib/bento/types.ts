export type Tier = "primary" | "secondary" | "tertiary" | "quaternary"

export type Placement = "feature" | "fill"

export interface AspectBand {
  min: number
  ideal: number
  max: number
}

export interface TileMeta {
  id: string
  priority: Tier
  minW: number
  minH: number
  /**
   * Preferred (content-fitted) size from the DOM measure pass. The LP targets
   * this instead of a viewport-area quota, so a tile starts sized to its content.
   * minW/minH remain the hard "won't clip" floor.
   */
  prefW?: number
  prefH?: number
  /**
   * Reasonable MAXIMUM size. Slack absorption may grow a tile up to this to fill
   * available screen estate. Pebble tiles (footer, certs, status) get max ≈ pref
   * so they stay small; content-rich tiles (terminal, experience, …) get a much
   * larger max so they expand to use a big screen. Once every tile is at its max
   * and space remains, the whole wall is centred.
   */
  maxW?: number
  maxH?: number
  aspectRatio?: AspectBand
  cluster?: string
  clusterOrder?: number
  placement?: Placement
}

export interface AdjacencyHint {
  a: string
  b: string
  weight: number
}

export interface Viewport {
  w: number
  h: number
}

export interface GazePoint {
  x: number
  y: number
}

export interface Position {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export interface PackRequest {
  viewport: Viewport
  gaze: GazePoint
  gutter: number
  tiles: TileMeta[]
  adjacency: AdjacencyHint[]
}

export interface PackResponse {
  positions: Position[]
  totalHeight: number
  feasible: boolean
}

export interface SequencePairData {
  gammaPlus: string[]
  gammaMinus: string[]
}

export type WorkerMessageIn =
  | { kind: "anneal"; requestId: number; request: PackRequest }
  | { kind: "relax"; requestId: number; sp: SequencePairData; request: PackRequest }

export type WorkerMessageOut =
  | {
      kind: "annealed"
      requestId: number
      sp: SequencePairData
      positions: Position[]
      totalHeight: number
      feasible: boolean
      cost: number
    }
  | {
      kind: "relaxed"
      requestId: number
      positions: Position[]
      totalHeight: number
      feasible: boolean
    }
