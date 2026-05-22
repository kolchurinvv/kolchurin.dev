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

export type PackRequest = {
  viewport: Viewport
  gaze: GazePoint
  gutter: number
  tiles: TileMeta[]
  overflowingIds?: string[]
}

export type PackResponse =
  | { mode: "pack"; positions: Position[] }
  | { mode: "boring" }
