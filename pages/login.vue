<script setup lang="ts">
import { Github, Loader2 } from "lucide-vue-next";
import packageJson from "../package.json";



definePageMeta({
  layout: false,
});

// Check if already authenticated and redirect to home
const { data: authStatus } = await useFetch("/api/auth/status");

if (authStatus.value?.authenticated) {
  await navigateTo("/");
}

const password = ref("");
const isSubmitting = ref(false);
const error = ref("");
const appVersion = packageJson.version;

async function handleLogin() {
  if (!password.value) {
    error.value = "Password is required";

    return;
  }

  isSubmitting.value = true;
  error.value = "";

  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: { password: password.value },
    });

    // Redirect to home page
    await navigateTo("/");
  }
  catch (err) {
    error.value = (err as { statusMessage?: string }).statusMessage || "Invalid password";
  }
  finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img alt="no-tion logo" class="login-logo" src="/logo.png">
        <p class="login-subtitle">
          Enter the password to continue
        </p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="login-input"
            :disabled="isSubmitting"
            autofocus
          >
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button
          type="submit"
          class="login-button"
          :disabled="isSubmitting || !password"
        >
          <Loader2 v-if="isSubmitting" :size="16" class="spinner" />
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- GitHub Link -->
      <div class="login-footer">
        <a
          href="http://git.ouss.es/no-tion"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
          :title="`View on GitHub - v${appVersion}`"
        >
          <Github :size="16" />
          <span class="github-text">View on GitHub</span>
          <span class="version-badge">v{{ appVersion }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: 20px;
}

@media (max-width: 640px) {
  .login-container {
    padding: 0;
  }
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  padding: 48px 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 640px) {
  .login-card {
    padding: 32px 24px;
    max-width: 100%;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

@media (prefers-color-scheme: dark) {
  .login-card {
    background: rgba(255, 255, 255, 0.055);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

@media (max-width: 640px) {
  .login-header {
    margin-bottom: 24px;
  }
}

.login-logo {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .login-logo {
    width: 64px;
    height: 64px;
  }
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: rgba(55, 53, 47, 0.65);
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  .login-subtitle {
    color: rgba(255, 255, 255, 0.45);
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(55, 53, 47, 0.16);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text);
  background: white;
  transition: all 20ms ease-in;
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .login-input {
    padding: 14px 16px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

.login-input:focus {
  outline: none;
  border-color: #2383e2;
  box-shadow: 0 0 0 3px rgba(35, 131, 226, 0.1);
}

.login-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .login-input {
    background: rgba(255, 255, 255, 0.055);
    border-color: rgba(255, 255, 255, 0.094);
  }

  .login-input:focus {
    background: rgba(255, 255, 255, 0.08);
  }
}

.error-message {
  padding: 10px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  color: #ef4444;
  font-size: 13px;
  text-align: center;
}

.login-button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 4px;
  background: #2383e2;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 20ms ease-in;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 640px) {
  .login-button {
    padding: 14px 16px;
    font-size: 16px;
  }
}

.login-button:hover:not(:disabled) {
  background: #1a6dc7;
}

.login-button:disabled {
  background: rgba(55, 53, 47, 0.16);
  color: rgba(55, 53, 47, 0.4);
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .login-button:disabled {
    background: rgba(255, 255, 255, 0.094);
    color: rgba(255, 255, 255, 0.3);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(55, 53, 47, 0.09);
  display: flex;
  justify-content: center;
}

@media (prefers-color-scheme: dark) {
  .login-footer {
    border-top-color: rgba(255, 255, 255, 0.09);
  }
}

.github-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  background: transparent;
  color: rgba(55, 53, 47, 0.65);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 20ms ease-in;
}

@media (max-width: 640px) {
  .github-link {
    font-size: 12px;
    padding: 6px 10px;
    gap: 6px;
  }

  .github-link .github-text {
    display: none;
  }

  .github-link .version-badge {
    font-size: 10px;
    padding: 2px 5px;
  }
}

.github-link:hover {
  background: rgba(55, 53, 47, 0.08);
  color: var(--color-text);
}

.github-link .version-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(55, 53, 47, 0.08);
  color: rgba(55, 53, 47, 0.65);
  transition: all 20ms ease-in;
}

.github-link:hover .version-badge {
  background: rgba(55, 53, 47, 0.12);
  color: var(--color-text);
}

@media (prefers-color-scheme: dark) {
  .github-link {
    color: rgba(255, 255, 255, 0.45);
  }

  .github-link:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }

  .github-link .version-badge {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.45);
  }

  .github-link:hover .version-badge {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
