<script lang="ts" setup>
const page = usePage();
const title = computed(() => page.value?.title ?? "");
</script>

<template>
  <h1>{{ title }}</h1>
</template>
