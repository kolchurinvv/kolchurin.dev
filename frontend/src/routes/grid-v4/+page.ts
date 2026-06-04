import { redirect } from "@sveltejs/kit"

// The /grid-v4 priority-anchored layout has been subsumed by the bento layout.
// Permanently send any old links/bookmarks to its replacement.
export const load = () => {
  redirect(308, "/bento")
}
