<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <header>
    <div class="header-content">
      <img alt="no-tion logo" class="logo" src="/logo.png" width="48" height="48">
      <h1>no-tion</h1>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  background-color: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  display: block;
  border-radius: 8px;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}
</style>
