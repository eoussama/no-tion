<script lang="ts" setup>
const page = usePage();

const title = computed(() => page.value?.title ?? "");
const lazy = computed(() => page.value?.lazy ?? false);
</script>

<template>
  <h1 v-if="lazy">
    Loading title...
  </h1>
  <h1 v-else>
    {{ title }}
  </h1>
</template>
