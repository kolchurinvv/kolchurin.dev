import { betterAuth, type BetterAuthInstance } from "better-auth";

let authInstance: BetterAuthInstance | null = null;
let initError: Error | null = null;

function initAuth(): BetterAuthInstance {
  if (initError) {
    throw initError;
  }
  if (authInstance) {
    return authInstance;
  }

  try {
    authInstance = betterAuth({
      database: {
        provider: "redis",
        url: "redis://localhost:6379",
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
    });
    return authInstance;
  } catch (e) {
    initError = e as Error;
    throw initError;
  }
}

function createAuthHandler() {
  try {
    return initAuth().handler;
  } catch {
    return async () => {
      return new Response(
        JSON.stringify({ error: "Authentication service unavailable" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    };
  }
}

export const auth = {
  get handler() {
    return createAuthHandler();
  },
  get api() {
    return initAuth().api;
  },
  get options() {
    return initAuth().options;
  },
};