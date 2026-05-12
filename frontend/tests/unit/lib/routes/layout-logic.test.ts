import { describe, expect, it } from "vitest"
import {
  computePriorityLayout,
  getCellStyleFromLayout,
  getMasonryColumnCount,
  resolveGridMetrics,
} from "$lib/routes/layout-logic"

describe("layout-logic", () => {
  it("resolves responsive grid metrics", () => {
    expect(resolveGridMetrics(2200, 900)).toMatchObject({ gridCols: 4, gridRows: 3 })
    expect(resolveGridMetrics(1400, 1000)).toMatchObject({ gridCols: 3, gridRows: 3 })
    expect(resolveGridMetrics(900, 1400)).toMatchObject({ gridCols: 2, gridRows: 4 })
  })

  it("computes non-overlapping priority layout", () => {
    const sections = [{ priority: 10 }, { priority: 6 }, { priority: 2 }, { priority: 1 }]
    const layout = computePriorityLayout(sections, 3, 3)

    expect(layout).toHaveLength(sections.length)

    const occupied = new Set<string>()
    for (const cell of layout) {
      for (let y = 0; y < cell.rowSpan; y++) {
        for (let x = 0; x < cell.colSpan; x++) {
          const key = `${cell.col + x},${cell.row + y}`
          expect(occupied.has(key)).toBe(false)
          occupied.add(key)
        }
      }
    }
  })

  it("builds absolute style string for a cell", () => {
    const style = getCellStyleFromLayout(
      { col: 1, row: 0, colSpan: 1, rowSpan: 2 },
      { containerWidth: 1200, containerHeight: 900, gridCols: 3, gridRows: 3 }
    )

    expect(style).toContain("left:")
    expect(style).toContain("top:")
    expect(style).toContain("width:")
    expect(style).toContain("height:")
  })

  it("maps viewport width to masonry column count", () => {
    expect(getMasonryColumnCount(2000)).toBe(4)
    expect(getMasonryColumnCount(1600)).toBe(3)
    expect(getMasonryColumnCount(1200)).toBe(2)
    expect(getMasonryColumnCount(800)).toBe(1)
  })
})
