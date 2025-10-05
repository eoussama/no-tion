import type { TNotionWorkspaceData } from "~/core";
import { useQuery } from "@tanstack/vue-query";



/**
 * @description
 * Custom hook for fetching workspace data using TanStack Query.
 *
 * @returns Query result with workspace data including user, workspace info, and databases
 */
export function useWorkspaceQuery() {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: async () => {
      const data = await $fetch<TNotionWorkspaceData>("/api/notion/workspace");

      return data;
    },
  });
}
