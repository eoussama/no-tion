<script lang="ts" setup>
import type { TNotionDatabase } from "~~/core";



const { name } = useRoute();
const { updatePage } = usePages();

const id = useRoute().params.id as string;
const res = useApiLazy<TNotionDatabase>(`notion/database/${id}`);

res.then(e => {
  const title = e.data.value?.data?.title ?? id ?? "Unknown Database";
  updatePage(name as string, { title, crumb: { label: title }, lazy: false });
});
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
