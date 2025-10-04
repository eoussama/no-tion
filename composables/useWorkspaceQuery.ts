import type { TNotionWorkspaceData } from "~/core";
import { useQuery } from "@tanstack/vue-query";



/**
 *
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
