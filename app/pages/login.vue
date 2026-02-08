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
	<input type="password" v-model="password" />
	<button @click="onLogin">Login</button>
</template>