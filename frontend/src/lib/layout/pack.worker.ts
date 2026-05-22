/// <reference lib="webworker" />
import { packAnchored } from "./pack"
import type { PackRequest, PackResponse } from "./types"

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = (event: MessageEvent<PackRequest>) => {
  const response: PackResponse = packAnchored(event.data)
  ctx.postMessage(response)
}
