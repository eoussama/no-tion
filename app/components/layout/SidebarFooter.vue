<script lang="ts" setup>
import { version } from "../../../package.json";



defineProps<{
  collapsed?: boolean;
}>();
</script>

<template>
  <div v-if="!collapsed" class="flex h-6.5 items-center justify-between px-2.5 text-xs text-muted">
    <span>v{{ version }}</span>
    <a href="http://git.ouss.es/no-tion" target="_blank" rel="noopener noreferrer" class="focus-ring rounded-sm hover:text-default hover:underline">Source</a>
  </div>
</template>
