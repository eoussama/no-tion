<script setup lang="ts">
import { ref } from "vue";


const password = ref("");

async function onLogin(): Promise<void> {
	const [err, success] = await useAuth().login(password.value);

	if (err || !success) {
		console.error("Login failed:", err);
		return;
	}

	navigateTo("/");
}
</script>

<template>
	Login Page <br>
	<input type="password" v-model="password" />
	<button @click="onLogin">Login</button>
</template>