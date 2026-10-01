<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

import { useWorkspaceQuery } from "~/queries";



defineProps<{
  collapsed?: boolean;
}>();

const emit = defineEmits<{
  logout: [];
}>();

const { data: workspace, isError } = useWorkspaceQuery();

const subtitle = computed(() => {
  if (workspace.value) {
    return workspace.value.connected ? workspace.value.name ?? "Connected to Notion" : "Not connected";
  }

  return isError.value ? "Workspace unavailable" : "Connecting...";
});

const items = computed<Array<Array<DropdownMenuItem>>>(() => [
  [{ type: "label", label: workspace.value?.name ?? "Notion workspace" }],
  [
    { label: "Open Notion", icon: "i-lucide-external-link", to: "https://www.notion.so", target: "_blank" },
    { label: "Source on GitHub", icon: "i-lucide-github", to: "http://git.ouss.es/no-tion", target: "_blank" },
  ],
  [{ label: "Log out", icon: "i-lucide-log-out", onSelect: () => emit("logout") }],
]);
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'start' }" :ui="{ content: 'w-56' }">
    <button
      type="button"
      aria-label="Workspace menu"
      class="focus-ring flex h-11 w-full min-w-0 items-center gap-2.5 rounded-md px-2 text-start text-default hover:bg-hover"
      :class="{ 'justify-center px-0': collapsed }"
    >
      <img src="/logo.png" alt="" class="size-6 shrink-0 rounded-[5px] object-cover ring-1 ring-default">
      <template v-if="!collapsed">
        <span class="flex min-w-0 flex-1 flex-col leading-tight">
          <span class="truncate text-sm font-semibold">no-tion</span>
          <span class="truncate text-xs text-muted">{{ subtitle }}</span>
        </span>
        <UIcon name="i-lucide-chevrons-up-down" class="size-3.5 shrink-0 text-muted" />
      </template>
    </button>
  </UDropdownMenu>
</template>
