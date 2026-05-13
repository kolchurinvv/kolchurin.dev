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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getPriorityScore(priority: number, minPriority: number, maxPriority: number): number {
  if (maxPriority === minPriority) {
    return 1;
  }

  return clamp((priority - minPriority) / (maxPriority - minPriority), 0, 1);
}

function getSpanCandidates(
  score: number,
  gridCols: number,
  gridRows: number,
): Array<{ colSpan: number; rowSpan: number }> {
  const candidates: Array<{ colSpan: number; rowSpan: number }> = [];

  if (score >= 0.75) {
    candidates.push({ colSpan: 2, rowSpan: 2 });
    candidates.push({ colSpan: 2, rowSpan: 1 });
    candidates.push({ colSpan: 1, rowSpan: 2 });
  } else if (score >= 0.45) {
    candidates.push({ colSpan: 2, rowSpan: 1 });
    candidates.push({ colSpan: 1, rowSpan: 2 });
  }

  candidates.push({ colSpan: 1, rowSpan: 1 });

  return candidates.filter((candidate) => {
    return candidate.colSpan <= gridCols && candidate.rowSpan <= gridRows;
  });
}

export function computePriorityLayout<T extends PrioritySection>(
  sections: T[],
  gridCols: number,
  gridRows: number,
): LayoutCell[] {
  const layout: LayoutCell[] = new Array(sections.length);
  const usedCells = new Set<string>();

  const maxPriority = Math.max(...sections.map((section) => section.priority));
  const minPriority = Math.min(...sections.map((section) => section.priority));

  const centerCol = (gridCols - 1) / 2;
  const centerRow = (gridRows - 1) / 2;

  const allPositions: Array<{ col: number; row: number; distance: number }> = [];

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      allPositions.push({
        col,
        row,
        distance: Math.abs(col - centerCol) + Math.abs(row - centerRow),
      });
    }
  }

  const sortedSections = sections
    .map((section, index) => ({ section, index }))
    .sort((a, b) => b.section.priority - a.section.priority);

  for (let sortedIndex = 0; sortedIndex < sortedSections.length; sortedIndex++) {
    const { section, index } = sortedSections[sortedIndex];
    const score = getPriorityScore(section.priority, minPriority, maxPriority);
    const spanCandidates = getSpanCandidates(score, gridCols, gridRows);

    const preferCenter = score >= 0.4;
    const sortedPositions = [...allPositions].sort((a, b) => {
      return preferCenter ? a.distance - b.distance : b.distance - a.distance;
    });

    let placed = false;

    for (const position of sortedPositions) {
      for (const span of spanCandidates) {
        if (
          position.col + span.colSpan > gridCols ||
          position.row + span.rowSpan > gridRows
        ) {
          continue;
        }

        const totalCells = gridCols * gridRows;
        const remainingSections = sortedSections.length - sortedIndex;
        const reservedCellsForRemainingSections = remainingSections - 1;
        const availableCells = totalCells - usedCells.size;
        const requestedCells = span.colSpan * span.rowSpan;

        if (requestedCells > availableCells - reservedCellsForRemainingSections) {
          continue;
        }

        let canFit = true;

        for (let dy = 0; dy < span.rowSpan && canFit; dy++) {
          for (let dx = 0; dx < span.colSpan && canFit; dx++) {
            if (usedCells.has(`${position.col + dx},${position.row + dy}`)) {
              canFit = false;
            }
          }
        }

        if (!canFit) {
          continue;
        }

        layout[index] = {
          col: position.col,
          row: position.row,
          colSpan: span.colSpan,
          rowSpan: span.rowSpan,
        };

        for (let dy = 0; dy < span.rowSpan; dy++) {
          for (let dx = 0; dx < span.colSpan; dx++) {
            usedCells.add(`${position.col + dx},${position.row + dy}`);
          }
        }

        placed = true;
        break;
      }

      if (placed) {
        break;
      }
    }

    if (!placed) {
      for (let row = 0; row < gridRows && !placed; row++) {
        for (let col = 0; col < gridCols && !placed; col++) {
          if (!usedCells.has(`${col},${row}`)) {
            layout[index] = { col, row, colSpan: 1, rowSpan: 1 };
            usedCells.add(`${col},${row}`);
            placed = true;
          }
        }
      }
    }
  }

  return layout;
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

  if (viewportWidth > 1450) {
    return 3;
  }

  if (viewportWidth > 1100) {
    return 2;
  }

  return 1;
}

export interface FluidGridConfig {
  baseColumns: number;
  priorityToColSpan: Map<number, number>;
  priorityToRowSpan: Map<number, number>;
}

export interface FluidLayoutItem {
  id: string;
  priority: number;
  colSpan: number;
  rowSpan: number;
  order: number;
}

export function computeFluidLayout<T extends PrioritySection>(
  sections: T[],
  viewportWidth: number,
): FluidLayoutItem[] {
  const vw = viewportWidth || 1920;

  let baseCols: number;
  if (vw > 1600) {
    baseCols = 5;
  } else if (vw > 1200) {
    baseCols = 4;
  } else if (vw > 800) {
    baseCols = 3;
  } else {
    baseCols = 2;
  }

  const maxPriority = Math.max(...sections.map((s) => s.priority));
  const minPriority = Math.min(...sections.map((s) => s.priority));
  const range = maxPriority - minPriority || 1;

  const sorted = [...sections]
    .map((s, i) => ({ ...s, originalIndex: i }))
    .sort((a, b) => b.priority - a.priority);

  return sorted.map((section, sortedIndex) => {
    const normalizedPriority = (section.priority - minPriority) / range;

    let colSpan: number;
    let rowSpan: number;

    if (normalizedPriority >= 0.8) {
      colSpan = Math.min(3, baseCols);
      rowSpan = 3;
    } else if (normalizedPriority >= 0.5) {
      colSpan = Math.min(2, Math.floor(baseCols / 2) + 1);
      rowSpan = 2;
    } else if (normalizedPriority >= 0.2) {
      colSpan = Math.min(2, Math.floor(baseCols / 2));
      rowSpan = 2;
    } else {
      colSpan = 1;
      rowSpan = 1;
    }

    const remainingSlots = baseCols - (colSpan - 1);
    if (remainingSlots < 2 && sortedIndex < sorted.length - 1) {
      colSpan = 1;
      rowSpan = 1;
    }

    return {
      id: section.id,
      priority: section.priority,
      colSpan,
      rowSpan,
      order: sortedIndex,
    };
  });
}
