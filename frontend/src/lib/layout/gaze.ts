import type { GazePoint } from "./types"

const HORIZONTAL_BIAS = 0.5
const VERTICAL_BIAS = 0.38

const HORIZONTAL_MIN = 0.3
const HORIZONTAL_MAX = 0.7
const VERTICAL_MIN = 0.15
const VERTICAL_MAX = 0.55

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value))
}

function fallbackGaze(innerWidth: number, innerHeight: number): GazePoint {
  return { x: innerWidth * HORIZONTAL_BIAS, y: innerHeight * VERTICAL_BIAS }
}

export function computeGazePoint(win: Window): GazePoint {
  const innerW = win.innerWidth
  const innerH = win.innerHeight

  if (innerW <= 0 || innerH <= 0) return { x: 0, y: 0 }

  const screen = win.screen
  if (!screen || !Number.isFinite(screen.availWidth) || !Number.isFinite(screen.availHeight)) {
    return fallbackGaze(innerW, innerH)
  }

  const screenX = Number.isFinite(win.screenX) ? win.screenX : 0
  const screenY = Number.isFinite(win.screenY) ? win.screenY : 0
  const chromeH = Math.max(0, win.outerHeight - innerH)

  const screenGazeX = screen.availWidth * HORIZONTAL_BIAS
  const screenGazeY = screen.availHeight * VERTICAL_BIAS

  const rawX = screenGazeX - screenX
  const rawY = screenGazeY - screenY - chromeH

  const minX = innerW * HORIZONTAL_MIN
  const maxX = innerW * HORIZONTAL_MAX
  const minY = innerH * VERTICAL_MIN
  const maxY = innerH * VERTICAL_MAX

  const clampedX = clamp(rawX, minX, maxX)
  const clampedY = clamp(rawY, minY, maxY)

  const wasClamped = clampedX !== rawX || clampedY !== rawY
  if (wasClamped && (rawX < 0 || rawX > innerW || rawY < 0 || rawY > innerH)) {
    return fallbackGaze(innerW, innerH)
  }

  return { x: clampedX, y: clampedY }
}
