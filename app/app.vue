<script setup lang="ts">
import { useAuthStore } from "~/stores";



const auth = useAuthStore();

function onLogout(): void {
  auth.logout();
}
</script>

<template>
  <div class="app">
    <header>
      no-tion
      <button v-if="auth.isLoggedIn" @click="onLogout">Logout</button>
    </header>

    <main class="page">
      <NuxtPage />
    </main>
  </div>
</template>
