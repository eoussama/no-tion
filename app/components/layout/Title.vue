<script lang="ts" setup>
const title = ref<string>();

onMounted(() => {
  title.value = usePage()?.title!;
});
</script>

<template>
  <h1>{{ title }}</h1>
</template>
