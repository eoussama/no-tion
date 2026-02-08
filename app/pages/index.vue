<script setup lang="ts">
async function onLogout(): Promise<void> {
  useAuth().logout().finally(() => navigateTo("/login"));
}
</script>

<template>
  <h1>Home Page</h1>
  <p>Welcome to the home page!</p>

  <button @click="onLogout">Logout</button>
</template>