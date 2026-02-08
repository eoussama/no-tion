<script setup lang="ts">
import { ref } from "vue";

import { tryCatch } from "@eoussama/core";



const password = ref("");

async function onLogin(): Promise<void> {
	const [err, success] = await tryCatch(() => $fetch("/api/auth/login", { method: "POST", body: { password: password.value }, credentials: "include" }));

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