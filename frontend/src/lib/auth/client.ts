import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient();

export const signIn = authClient.signIn;
export const signOut = authClient.signOut;
export const signUp = authClient.signUp;
export const useSession = authClient.useSession;