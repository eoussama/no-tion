<script setup lang="ts">
const auth = useAuthStore();
const logoutRequest = useAsyncData("logout", () => useAuthApi().logout(), { immediate: false, server: false });
const { pending } = logoutRequest;

function onLogout(): void {
  logoutRequest.execute();
}
</script>

<template>
  <div class="app">
    <header>
      no-tion
      <button v-if="auth.isLoggedIn" :disabled="pending" @click="onLogout">
        Logout
      </button>
      <hr>
    </header>

    <main class="page">
      <NuxtPage />
    </main>
  </div>
</template>
