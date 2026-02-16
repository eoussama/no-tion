<script lang="ts" setup>
import type { TNotionDatabase } from "~~/core";



const id = useRoute().params.id;
const res = useApiLazy<TNotionDatabase>(`notion/database/${id}`);
</script>

<template>
  <p>Associated ID: <b>{{ id }}</b></p>

  <div>
    <p v-if="res?.pending.value" class="text-red-500">
      Fetching database info...
    </p>

    <p v-else-if="res?.error.value" class="text-red-500">
      {{ res.error.value }}
    </p>

    <code v-else>
      {{ res?.data.value?.data }}
    </code>
  </div>
</template>
