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
import { lpSolve } from "./lp-solver"
import { SequencePair } from "./sequence-pair"
import type { WorkerMessageIn, WorkerMessageOut } from "./types"

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = (event: MessageEvent<WorkerMessageIn>) => {
  const msg = event.data
  switch (msg.kind) {
    case "anneal": {
      const cfg = defaultAnnealConfig(msg.requestId)
      const result = anneal(
        msg.request.tiles,
        msg.request.adjacency,
        msg.request.viewport,
        msg.request.gaze,
        msg.request.gutter,
        DEFAULT_WEIGHTS,
        cfg
      )
      const out: WorkerMessageOut = {
        kind: "annealed",
        requestId: msg.requestId,
        sp: result.sp.toData(),
        positions: result.positions,
        totalHeight: result.totalHeight,
        feasible: result.feasible,
        cost: result.cost,
      }
      ctx.postMessage(out)
      break
    }
    case "relax": {
      const sp = SequencePair.fromData(msg.sp)
      const r = lpSolve(sp, msg.request.tiles, msg.request.viewport, msg.request.gutter)
      const out: WorkerMessageOut = {
        kind: "relaxed",
        requestId: msg.requestId,
        positions: r.positions,
        totalHeight: r.totalHeight,
        feasible: r.feasible,
      }
      ctx.postMessage(out)
      break
    }
  }
}
