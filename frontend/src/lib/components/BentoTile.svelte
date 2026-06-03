<script lang="ts">
import { onDestroy, onMount, type Snippet } from "svelte"
import { useBentoRegistry } from "$lib/bento/bento-registry.svelte"
import type { AspectBand, Placement, Tier } from "$lib/bento/types"

type Props = {
  id: string
  priority: Tier
  minWidth?: number
  minHeight?: number
  aspectRatio?: AspectBand
  cluster?: string
  clusterOrder?: number
  placement?: Placement
  ariaLabelledby?: string
  children: Snippet
}

let {
  id,
  priority,
  minWidth = 180,
  minHeight = 120,
  aspectRatio,
  cluster,
  clusterOrder,
  placement,
  ariaLabelledby,
  children,
}: Props = $props()

const registry = useBentoRegistry()
let el = $state<HTMLElement | undefined>()

onMount(() => {
  if (el) {
    registry.register({
      id,
      priority,
      minW: minWidth,
      minH: minHeight,
      aspectRatio,
      cluster,
      clusterOrder,
      placement,
      el,
    })
  }
})

onDestroy(() => {
  registry.unregister(id)
})

const position = $derived(registry.positions[id])
const mode = $derived(registry.mode)

const style = $derived.by(() => {
  if (mode === "pack" && position) {
    return [
      "position: absolute",
      "left: 0",
      "top: 0",
      `transform: translate3d(${position.x}px, ${position.y}px, 0)`,
      `width: ${position.w}px`,
      `height: ${position.h}px`,
    ].join("; ")
  }
  // boring or measuring — flow naturally in DOM source order.
  return ""
})
</script>

<section
  bind:this={el}
  class="bento-tile"
  data-tile={id}
  data-priority={priority}
  data-cluster={cluster}
  data-placement={placement}
  aria-labelledby={ariaLabelledby}
  style={style}
>
  {@render children()}
</section>

<style>
.bento-tile {
  box-sizing: border-box;
  overflow: hidden;
}
</style>
