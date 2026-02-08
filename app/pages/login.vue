<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "~/stores";



const password = ref("");

function onLogin() {
  useAuthStore().login(password.value);
}
</script>

<template>
  Login Page <br>
  <input v-model="password" type="password">
  <button @click="onLogin">
    Login
  </button>
</template>
