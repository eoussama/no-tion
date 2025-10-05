<script setup lang="ts">
import type { TNullable } from "~/core";
import { Building2, Github, LogOut, XCircle } from "lucide-vue-next";
import packageJson from "./package.json";



const route = useRoute();
const isLoginPage = computed(() => route.path === "/login");

const { data, error: fetchError, isPending } = useWorkspaceQuery();

const workspace = computed(() => {
  if (!data.value?.workspace) {
    return null;
  }

  return data.value.workspace as TNullable<typeof data.value.workspace>;
});
const user = computed(() => {
  if (!data.value?.user) {
    return null;
  }

  return data.value.user as TNullable<typeof data.value.user>;
});
const loading = computed(() => isPending.value);
const error = computed(() => (fetchError.value?.message || null) as TNullable<string>);
const isConnected = computed(() => !loading.value && !error.value && (user.value || workspace.value));

const appVersion = packageJson.version;

async function handleLogout() {
  await $fetch("/api/auth/logout", { method: "POST" });
  await navigateTo("/login");
}
</script>

<template>
  <div class="app-container">
    <header v-if="!isLoginPage" class="topbar">
      <div class="topbar-content">
        <NuxtLink to="/" class="topbar-left">
          <img alt="no-tion logo" class="logo" src="/logo.png">
          <span class="app-title">no-tion</span>
        </NuxtLink>

        <div class="topbar-right">
          <div v-if="loading" class="header-status">
            <div class="spinner-small" />
            <span class="header-status-text">Connecting...</span>
          </div>

          <div v-else-if="error" class="header-status header-status-error">
            <XCircle :size="16" />
            <span class="header-status-text">Not Connected</span>
          </div>

          <div v-else-if="isConnected" class="header-status header-status-connected">
            <Building2 :size="16" />
            <span class="header-status-text">{{ workspace?.name || 'Workspace' }}</span>
            <span class="header-status-dot" />
          </div>

          <a
            href="http://git.ouss.es/no-tion"
            target="_blank"
            rel="noopener noreferrer"
            class="github-button"
            :title="`View on GitHub - v${appVersion}`"
          >
            <Github :size="16" />
            <span class="version-badge">v{{ appVersion }}</span>
          </a>

          <button class="logout-button" title="Logout" @click="handleLogout">
            <LogOut :size="16" />
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--color-background);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-background);
  border-bottom: 1px solid rgba(55, 53, 47, 0.09);
  backdrop-filter: blur(8px);
}

@media (prefers-color-scheme: dark) {
  .topbar {
    border-bottom-color: rgba(255, 255, 255, 0.09);
  }
}

.topbar-content {
  width: 100%;
  padding: 0 96px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  padding: 4px 8px;
  margin: -4px -8px;
  border-radius: 4px;
  transition: background 20ms ease-in;
}

.topbar-left:hover {
  background: rgba(55, 53, 47, 0.08);
}

@media (prefers-color-scheme: dark) {
  .topbar-left:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.logo {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}

.app-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  background: transparent;
  color: rgba(55, 53, 47, 0.65);
  border-radius: 4px;
  cursor: pointer;
  transition: all 20ms ease-in;
}

.logout-button:hover {
  background: rgba(55, 53, 47, 0.08);
  color: var(--color-text);
}

@media (prefers-color-scheme: dark) {
  .logout-button {
    color: rgba(255, 255, 255, 0.45);
  }

  .logout-button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }
}

.github-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  color: rgba(55, 53, 47, 0.65);
  border-radius: 4px;
  cursor: pointer;
  transition: all 20ms ease-in;
  text-decoration: none;
}

.github-button:hover {
  background: rgba(55, 53, 47, 0.08);
  color: var(--color-text);
}

.version-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(55, 53, 47, 0.08);
  color: rgba(55, 53, 47, 0.65);
  transition: all 20ms ease-in;
}

.github-button:hover .version-badge {
  background: rgba(55, 53, 47, 0.12);
  color: var(--color-text);
}

@media (prefers-color-scheme: dark) {
  .github-button {
    color: rgba(255, 255, 255, 0.45);
  }

  .github-button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }

  .version-badge {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.45);
  }

  .github-button:hover .version-badge {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }
}

.header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.header-status-connected {
  background: rgba(0, 135, 107, 0.1);
  color: rgb(0, 135, 107);
}

@media (prefers-color-scheme: dark) {
  .header-status-connected {
    background: rgba(0, 200, 117, 0.15);
    color: rgb(0, 200, 117);
  }
}

.header-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  margin-left: 2px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.header-status-error {
  background: rgba(235, 87, 87, 0.1);
  color: rgb(235, 87, 87);
}

@media (prefers-color-scheme: dark) {
  .header-status-error {
    background: rgba(235, 87, 87, 0.15);
    color: rgb(255, 100, 100);
  }
}

.header-status-text {
  white-space: nowrap;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(55, 53, 47, 0.16);
  border-top-color: rgba(55, 53, 47, 0.65);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@media (prefers-color-scheme: dark) {
  .spinner-small {
    border-color: rgba(255, 255, 255, 0.16);
    border-top-color: rgba(255, 255, 255, 0.65);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 96px;
}

@media (max-width: 1024px) {
  .topbar-content,
  .main-content {
    padding: 0 48px;
  }
}

@media (max-width: 768px) {
  .topbar-content {
    padding: 0 24px;
  }

  .main-content {
    padding: 0 24px;
  }
}
</style>
