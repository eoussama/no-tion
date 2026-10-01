<script lang="ts" setup>
import { useSyncStatus } from "~/queries";



/**
 * @description
 * Icon-only sync indicator and manual refresh, for the navbar. State is conveyed by the icon's color and a
 * tooltip (no visible label); a click always spins the icon while the refresh is in flight.
 */
const { state, pending, lastSyncedAt, refresh } = useSyncStatus();

const now = useNow({ interval: 30_000 });

const label = computed(() => {
  switch (state.value) {
    case "syncing": return `${pending.value} ${pending.value === 1 ? "change" : "changes"} syncing`;

    case "offline": return "Offline · cached data";

    case "refreshing": return "Refreshing...";

    default: return lastSyncedAt.value ? `Synced ${formatRelative(lastSyncedAt.value, now.value.getTime())}` : "Synced";
  }
});

const color = computed(() => ({
  syncing: "text-dot-blue",
  refreshing: "text-dot-blue",
  offline: "text-dot-gray",
  synced: "text-dot-green",
})[state.value]);

const spinning = ref(false);

async function onRefresh(): Promise<void> {
  spinning.value = true;

  try {
    await refresh();
  }
  finally {
    spinning.value = false;
  }
}
</script>

<template>
  <UTooltip :text="label">
    <UButton
      color="neutral"
      variant="ghost"
      size="sm"
      icon="i-lucide-refresh-cw"
      :aria-label="label"
      :disabled="state === 'offline'"
      :ui="{ leadingIcon: [color, spinning || state === 'refreshing' ? 'animate-spin' : ''].join(' ') }"
      @click="onRefresh"
    />
  </UTooltip>
</template>
