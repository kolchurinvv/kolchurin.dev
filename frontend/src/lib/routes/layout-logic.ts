export interface PrioritySection {
  priority: number;
}

export interface GridMetrics {
  gridCols: number;
  gridRows: number;
  containerWidth: number;
  containerHeight: number;
}

export interface LayoutCell {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export function resolveGridMetrics(
  viewportWidth: number,
  viewportHeight: number,
): GridMetrics {
  const vw = viewportWidth || 1920;
  const vh = viewportHeight || 1080;
  const aspectRatio = vw / vh;

  let cols = 3;
  let rows = 3;

  if (aspectRatio > 2.0) {
    cols = 4;
    rows = 3;
  } else if (aspectRatio > 1.3) {
    cols = 3;
    rows = 3;
  } else {
    cols = 2;
    rows = 4;
  }

  return {
    gridCols: cols,
    gridRows: rows,
    containerWidth: vw - 48,
    containerHeight: vh - 48,
  };
}

export function computePriorityLayout<T extends PrioritySection>(
  sections: T[],
  gridCols: number,
  gridRows: number,
): LayoutCell[] {
  const centerCol = gridCols >= 3 ? 1 : 0;
  const centerRow = gridRows >= 3 ? 1 : 0;

  const newLayout: LayoutCell[] = [];
  const usedCells = new Set<string>();

  for (const section of sections) {
    let placed = false;

    const preferCenter = section.priority >= 5;
    const wantsLargeSpan = section.priority >= 3;

    const positions: { col: number; row: number }[] = [];

    if (preferCenter) {
      positions.push({ col: centerCol, row: centerRow });
    }

    if (section.priority <= 2) {
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const isCorner =
            (row === 0 || row === gridRows - 1) &&
            (col === 0 || col === gridCols - 1);

          if (isCorner) {
            positions.unshift({ col, row });
          }
        }
      }
    }

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        if (!positions.some((position) => position.col === col && position.row === row)) {
          positions.push({ col, row });
        }
      }
    }

    for (const position of positions) {
      let spanW = wantsLargeSpan ? (section.priority >= 5 ? 2 : 1) : 1;
      let spanH = wantsLargeSpan && section.priority >= 5 ? 2 : 1;

      if (position.col + spanW > gridCols) {
        spanW = 1;
      }

      if (position.row + spanH > gridRows) {
        spanH = 1;
      }

      let canFit = true;

      for (let dy = 0; dy < spanH && canFit; dy++) {
        for (let dx = 0; dx < spanW && canFit; dx++) {
          if (usedCells.has(`${position.col + dx},${position.row + dy}`)) {
            canFit = false;
          }
        }
      }

      if (canFit) {
        newLayout.push({
          col: position.col,
          row: position.row,
          colSpan: spanW,
          rowSpan: spanH,
        });

        for (let dy = 0; dy < spanH; dy++) {
          for (let dx = 0; dx < spanW; dx++) {
            usedCells.add(`${position.col + dx},${position.row + dy}`);
          }
        }

        placed = true;
        break;
      }
    }

    if (!placed) {
      for (let row = 0; row < gridRows && !placed; row++) {
        for (let col = 0; col < gridCols && !placed; col++) {
          if (!usedCells.has(`${col},${row}`)) {
            newLayout.push({ col, row, colSpan: 1, rowSpan: 1 });
            usedCells.add(`${col},${row}`);
            placed = true;
          }
        }
      }
    }
  }

  return newLayout;
}

export function getCellStyleFromLayout(
  cell: LayoutCell,
  metrics: Pick<GridMetrics, "containerWidth" | "containerHeight" | "gridCols" | "gridRows">,
): string {
  const cellW = (metrics.containerWidth / metrics.gridCols) * cell.colSpan;
  const cellH = (metrics.containerHeight / metrics.gridRows) * cell.rowSpan;
  const cellX = (metrics.containerWidth / metrics.gridCols) * cell.col;
  const cellY = (metrics.containerHeight / metrics.gridRows) * cell.row;

  return `left: ${cellX + 24}px; top: ${cellY + 24}px; width: ${cellW - 8}px; height: ${cellH - 8}px;`;
}

export function getMasonryColumnCount(viewportWidth: number): number {
  if (viewportWidth > 1800) {
    return 4;
  }

  if (viewportWidth > 1400) {
    return 3;
  }

  if (viewportWidth > 900) {
    return 2;
  }

  return 1;
}
