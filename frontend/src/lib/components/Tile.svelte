<script lang="ts">
import { onDestroy, onMount, type Snippet } from "svelte"
import { useRegistry } from "$lib/layout/registry.svelte"

type Props = {
  id: string
  priority: number
  minWidth?: number
  minHeight?: number
  children: Snippet
}

let { id, priority, minWidth = 200, minHeight = 120, children }: Props = $props()

const registry = useRegistry()
let el = $state<HTMLDivElement | undefined>()
let mounted = false

onMount(() => {
  mounted = true
  if (el) {
    registry.register({ id, priority, minWidth, minHeight, el })
  }
})

onDestroy(() => {
  registry.unregister(id)
})

$effect(() => {
  if (mounted) registry.updatePriority(id, priority)
})

const position = $derived(registry.positions[id])
const mode = $derived(registry.mode)
const probeWidth = $derived(registry.probeWidth)

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
  if (mode === "boring") {
    return `order: ${-priority}`
  }
  // measuring / hidden: render at constrained probe width so scrollHeight reflects realistic wrap
  return [
    "position: absolute",
    "left: 0",
    "top: 0",
    "visibility: hidden",
    `width: ${probeWidth}px`,
    "height: auto",
  ].join("; ")
})
</script>

<div
  bind:this={el}
  class="masonry-tile"
  data-tile={id}
  data-priority={priority}
  style={style}
>
  {@render children()}
</div>

<style>
.masonry-tile {
  box-sizing: border-box;
  overflow: hidden;
}
</style>
