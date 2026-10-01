<script lang="ts" setup>
defineProps<{
  collapsed?: boolean;
}>();
</script>

<template>
  <div v-if="!collapsed" class="mt-auto flex flex-col gap-0.5 pt-2 pb-2">
    <div class="flex h-8.5 items-center gap-2.5 ps-2.5 pe-1 font-medium text-side-text">
      <span class="flex-1">Sync</span>
      <SyncStatus />
    </div>

    <div class="flex h-8.5 items-center gap-2.5 ps-2.5 pe-1 font-medium text-side-text">
      <span class="flex-1">Appearance</span>
      <ColorModeSwitch />
    </div>
  </div>
</template>
