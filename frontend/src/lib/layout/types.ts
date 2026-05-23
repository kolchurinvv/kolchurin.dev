export type StripLabel = "top" | "bot" | "left" | "right"

export type TileMeta = {
  id: string
  priority: number
  minW: number
  minH: number
  naturalW: number
  naturalH: number
  requiredH?: number
}

export type Position = {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export type Viewport = {
  w: number
  h: number
}

export type GazePoint = {
  x: number
  y: number
}

export type AnchorSize = {
  w: number
  h: number
}

export type PackRequest = {
  viewport: Viewport
  gaze: GazePoint
  gutter: number
  tiles: TileMeta[]
  overflowingIds?: string[]
  /** Tile id to use as the anchor at the gaze point. Defaults to highest-priority. */
  anchorId?: string
  /** Fixed size for the anchor; bypasses weight-based sizing. */
  anchorSize?: AnchorSize
  /** Lock tile→strip mapping from a previous pack response. */
  pinnedAssignment?: Record<string, StripLabel>
}

export type PackResponse =
  | { mode: "pack"; positions: Position[]; assignment: Record<string, StripLabel> }
  | { mode: "boring" }
