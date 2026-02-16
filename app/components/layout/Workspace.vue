<script lang="ts" setup>
import type { TNotionWorkspace } from "~~/core";



const res = useApiLazy<TNotionWorkspace>("notion/workspace/info");
</script>

<template>
  <div>
    <p v-if="res?.pending.value" class="text-red-500">
      Fetching workspace...
    </p>

    <p v-else-if="res?.error.value" class="text-red-500">
      {{ res.error.value }}
    </p>

    <p v-else :title="res?.data.value?.data?.connected ? 'online' : 'offline'">
      {{ res?.data.value?.data?.name }}
    </p>
  </div>
</template>
