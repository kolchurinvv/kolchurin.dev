/// <reference lib="webworker" />
/**
 * Bento packer worker. Two message kinds:
 *   - anneal: full SA topology search + LP. Slow (~500ms for N=14).
 *   - relax:  LP only against a supplied SequencePair. Fast (~1-3ms).
 *
 * Every message carries `requestId`; the main thread ignores responses whose
 * requestId doesn't match the latest dispatch. This is essential for handling
 * rapid resize without race conditions.
 */
import { anneal } from "./annealer"
import { defaultAnnealConfig } from "./anneal-config"
import { DEFAULT_WEIGHTS } from "./cost-weights"
import { absorbSlack, lpSolve } from "./lp-solver"
import { SequencePair } from "./sequence-pair"
import type { WorkerMessageIn, WorkerMessageOut } from "./types"

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = (event: MessageEvent<WorkerMessageIn>) => {
  const msg = event.data
  switch (msg.kind) {
    case "anneal": {
      // Best-of-N restarts with FIXED seeds (NOT viewport-derived). A given width
      // is still deterministic (same seeds + same width), but — crucially — a
      // tiny width change (scrollbar present vs not) no longer reshuffles the
      // topology: the random walk is identical, only the cost landscape shifts.
      // Width-seeding made a 1px difference produce a totally different layout.
      // Best-of-N still finds a tight, wide, short pack vs a single loose run.
      const seeds = [101, 211, 331, 457]
      let result = null
      for (const seed of seeds) {
        const cfg = defaultAnnealConfig(seed) // fixed-iteration schedule (deterministic)
        const r = anneal(
          msg.request.tiles,
          msg.request.adjacency,
          msg.request.viewport,
          msg.request.gaze,
          msg.request.gutter,
          DEFAULT_WEIGHTS,
          cfg
        )
        if (result === null || r.cost < result.cost) result = r
      }
      if (result === null) break
      // Slack-absorption is render-only: apply it to the best topology the
      // annealer found, but the annealer itself optimised on raw positions.
      const absorbed = absorbSlack(
        result.positions,
        msg.request.tiles,
        msg.request.viewport,
        msg.request.gutter
      )
      const out: WorkerMessageOut = {
        kind: "annealed",
        requestId: msg.requestId,
        sp: result.sp.toData(),
        positions: absorbed.positions,
        totalHeight: absorbed.totalHeight,
        feasible: result.feasible,
        cost: result.cost,
      }
      ctx.postMessage(out)
      break
    }
    case "relax": {
      const sp = SequencePair.fromData(msg.sp)
      const r = lpSolve(sp, msg.request.tiles, msg.request.viewport, msg.request.gutter)
      const absorbed = absorbSlack(
        r.positions,
        msg.request.tiles,
        msg.request.viewport,
        msg.request.gutter
      )
      const out: WorkerMessageOut = {
        kind: "relaxed",
        requestId: msg.requestId,
        positions: absorbed.positions,
        totalHeight: absorbed.totalHeight,
        feasible: r.feasible,
      }
      ctx.postMessage(out)
      break
    }
  }
}
