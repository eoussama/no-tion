<script lang="ts" setup>
const [err, res] = await useApi("notion/workspace");

console.log({ err, res });
</script>

<template>
  <div title="The connected workspace">
    Workspace
  </div>
</template>
