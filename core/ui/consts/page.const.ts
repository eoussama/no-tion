import type { TPage } from "../types";

import type { Ref } from "vue";



/**
 * @description
 * Provides a shared, SSR-safe store for page registration data.
 * Uses Nuxt's `useState` so the server-rendered state transfers
 * to the client via the payload, preventing hydration mismatches.
 */
export function usePages(): Ref<Record<string, TPage>> {
  return useState<Record<string, TPage>>("pages", () => ({}));
}
