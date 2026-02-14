<script lang="ts" setup>
import type { TNotionWorkspace } from "~~/core";



const [_, res] = await useApi<TNotionWorkspace>("notion/workspace");
</script>

<template>
  <div title="The connected workspace">
    <p v-if="res?.pending.value" class="text-red-500">
      Fetching...
    </p>
    
    <p v-else-if="res?.error.value" class="text-red-500">
      {{ res.error.value }}
    </p>

    <p v-else :title="res?.data.value?.data?.connected ? 'online' : 'offline'">
      {{ res?.data.value?.data?.name }}
    </p>
  </div>
</template>
