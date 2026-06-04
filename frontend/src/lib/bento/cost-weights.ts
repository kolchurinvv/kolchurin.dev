/**
 * Cost-function weight set, tuned empirically in Phase 9.
 *
 * Symptom → which weight to bump:
 *   - all-square tiles, no variety            → shapeVariance ↑
 *   - same-tier tiles cluster together        → sizeVariance ↑
 *   - terminal not anchoring gaze             → gaze ↑ (or terminal aspectRatio looser)
 *   - clusters scatter                        → cluster ↑ (often needs ≥100)
 *   - long thin tiles                         → aspectBand ↑
 *   - header pushed below the viewport fold   → aboveFold ↑
 *   - large empty regions / orphaned tiles    → deadSpace ↑ (compactness pressure)
 *   - LP returning infeasible too often        → widthOverflow ↑ (already hard)
 *
 * Initial guesses — Phase 9 iterates on these.
 */
export interface CostWeights {
  overlap: number
  widthOverflow: number
  subMin: number
  aspectBand: number
  cluster: number
  adjacency: number
  sizeVariance: number
  shapeVariance: number
  gaze: number
  anchorRecurrence: number
  aboveFold: number
  deadSpace: number
}

export const DEFAULT_WEIGHTS: CostWeights = {
  overlap: 1e9,
  widthOverflow: 1e6,
  subMin: 1e6,
  // Cohesion must clearly beat the deadSpace pull and the experience↔skills
  // adjacency, or a member breaks out of the cluster to fill a void. With the
  // connectivity term (disconnected² × 4), one stray now costs ~150 × 4 = 600.
  aspectBand: 5,
  cluster: 150,
  adjacency: 8,
  sizeVariance: 3,
  shapeVariance: 3,
  gaze: 2,
  anchorRecurrence: 4,
  aboveFold: 30,
  // deadSpace is a [0,1] fraction, so its weight is its full contribution. It's
  // the dominant soft term on purpose — a compact, gap-free wall is the headline
  // goal — so it's weighted to beat cluster/adjacency/variance when they fight.
  deadSpace: 300,
}
