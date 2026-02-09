<script lang="ts" setup>
const crumbs = useBreadcrumb();
</script>

<template>
  <nav v-if="crumbs.length" class="breadcrumb">
    <ol>
      <li v-for="(crumb, index) in crumbs" :key="index">
        <NuxtLink v-if="crumb.href && index < crumbs.length - 1" :to="crumb.href">
          {{ crumb.label }}
        </NuxtLink>
        <span v-else>{{ crumb.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb ol {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5em;
}

.breadcrumb li + li::before {
  content: "/";
  margin-right: 0.5em;
}
</style>
