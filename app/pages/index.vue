<script setup lang="ts">
import { tryCatch } from "@eoussama/core";



async function onLogout(): Promise<void> {
  const [err, success] = await tryCatch(() => $fetch("/api/auth/logout", { method: "POST", credentials: "include" }));
  
  if (err || !success) {
    console.error("Logout failed:", err);
    return;
  }

  navigateTo("/login");
}
</script>

<template>
  <h1>Home Page</h1>
  <p>Welcome to the home page!</p>

  <button @click="onLogout">Logout</button>
</template>