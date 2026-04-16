import { toSvelteKitHandler } from "better-auth/svelte-kit";

let authModule: typeof import("$lib/auth/server") | null = null;

async function getHandler() {
  try {
    if (!authModule) {
      authModule = await import("$lib/auth/server");
    }
    return toSvelteKitHandler(authModule.auth);
  } catch {
    return async () => {
      return new Response(
        JSON.stringify({ error: "Authentication service unavailable" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    };
  }
}

export const GET = async (event) => {
  const handler = await getHandler();
  return handler(event);
};

export const POST = async (event) => {
  const handler = await getHandler();
  return handler(event);
};