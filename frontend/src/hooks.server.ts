import type { Handle } from "@sveltejs/kit";
import { building } from "$app/environment";

let authModule: typeof import("$lib/auth/server") | null = null;

async function getAuthModule() {
  if (!authModule) {
    try {
      authModule = await import("$lib/auth/server");
    } catch {
      return null;
    }
  }
  return authModule;
}

export const handle: Handle = async ({ event, resolve }) => {
  try {
    const module = await getAuthModule();
    if (!module) {
      return resolve(event);
    }

    const { auth, svelteKitHandler } = module;

    try {
      const session = await auth.api.getSession({
        headers: event.request.headers,
      });

      if (session) {
        event.locals.session = session.session;
        event.locals.user = session.user;
      }
    } catch {
      // Auth unavailable - continue without session
    }

    return svelteKitHandler({ event, resolve, auth, building: building })(event);
  } catch {
    return resolve(event);
  }
};