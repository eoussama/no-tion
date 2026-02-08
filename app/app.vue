<script setup lang="ts">
import { useAuthStore } from "~/stores";



const auth = useAuthStore();

function onLogout(): void {
  auth.logout();
  navigateTo("/login");
}
</script>

<template>
  <div class="app">
    <header>
      no-tion
      <button v-if="auth.isLoggedIn" @click="onLogout">
        Logout
      </button>
      <hr>
    </header>

    <main class="page">
      <NuxtPage />
    </main>
  </div>
</template>
