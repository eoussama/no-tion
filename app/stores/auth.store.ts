import type { TResponse } from "~~/core";

import { tryCatch } from "@eoussama/core";
import { defineStore } from "pinia";



/**
 * @description
 * localStorage key remembering the last known auth state, so cached data stays readable when the server is unreachable.
 */
const LAST_KNOWN_KEY = "no-tion:auth";

function readLastKnown(): boolean {
  try {
    return localStorage.getItem(LAST_KNOWN_KEY) === "1";
  }
  catch {
    return false;
  }
}

function writeLastKnown(isLoggedIn: boolean): void {
  try {
    if (isLoggedIn) {
      localStorage.setItem(LAST_KNOWN_KEY, "1");
    }
    else {
      localStorage.removeItem(LAST_KNOWN_KEY);
    }
  }
  catch {
    // Storage unavailable (private mode): nothing to remember.
  }
}

export const useAuthStore = defineStore("auth", () => {
  const nuxtApp = useNuxtApp();

  const isLoggedIn = ref(false);
  const isInitialized = ref(false);
  /** `true` when the last status check could not reach the server and the last known state is used. */
  const isOffline = ref(false);

  function setLoggedIn(value: boolean): void {
    isLoggedIn.value = value;
    writeLastKnown(value);
  }

  /**
   * @description
   * Logs in with the instance password. Rejects with the `$fetch` error on failure (e.g. wrong password).
   *
   * @param password - The instance password.
   * @returns Whether the user is now logged in.
   */
  async function login(password: string): Promise<boolean> {
    const res = await nuxtApp.$apiFetch<TResponse<boolean>>("auth/login", { method: "POST", body: { password } });

    setLoggedIn(Boolean(res.data));
    isInitialized.value = true;
    isOffline.value = false;

    return isLoggedIn.value;
  }

  /**
   * @description
   * Logs out on the server (idempotent), then clears the local state and the cached data (memory and IndexedDB).
   *
   * @returns A promise resolved once logged out.
   */
  async function logout(): Promise<void> {
    await tryCatch(() => nuxtApp.$apiFetch<TResponse<boolean>>("auth/logout", { method: "POST" }));
    await tryCatch(() => nuxtApp.$clearQueryCache());

    reset();
  }

  /**
   * @description
   * Checks the session status on the server.
   * When the server cannot be reached (network error or 5xx), the last known state is kept so cached data stays readable.
   *
   * @returns Whether the session is valid.
   */
  async function check(): Promise<boolean> {
    const [err, res] = await tryCatch(() => nuxtApp.$apiFetch<TResponse<boolean>>("auth/status", { method: "GET" }));

    isInitialized.value = true;

    if (err) {
      const status = getErrorStatus(err);
      const unreachable = status === undefined || status >= 500;

      isOffline.value = unreachable;
      setLoggedIn(unreachable ? readLastKnown() : false);

      return isLoggedIn.value;
    }

    isOffline.value = false;
    setLoggedIn(!res.error && Boolean(res.data));

    return isLoggedIn.value;
  }

  /**
   * @description
   * Resets the local auth state without calling the server (e.g. after a 401).
   */
  function reset(): void {
    setLoggedIn(false);
  }

  return { isLoggedIn, isInitialized, isOffline, login, logout, check, reset };
});
