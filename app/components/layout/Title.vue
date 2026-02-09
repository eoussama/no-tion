<script lang="ts" setup>
const title = computed(() => usePage()?.title ?? "");
</script>

<template>
  <h1>{{ title }}</h1>
</template>
