import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const path = url.pathname;

  if (path === "/meet/login" || path === "/meet/register") {
    return { user: locals.user };
  }

  if (!locals.session) {
    throw redirect(303, "/meet/login");
  }

  return {
    user: locals.user,
  };
};