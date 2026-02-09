<script setup lang="ts">
import { getPage } from "~~/core";
import pkg from "../package.json";



const auth = useAuthStore();

const logoutRequest = useAsyncData("logout", () => useAuthApi().logout(), { immediate: false, server: false });
const { pending } = logoutRequest;

function onLogout(): void {
  logoutRequest.execute();
}

console.log(getPage());
</script>

<template>
  <div class="app">
    <header v-if="auth.isLoggedIn">
      no-tion

      <span title="The connected workspace - online">Workspace •</span>

      <a href="http://git.ouss.es/no-tion" target="_blank">{{ pkg.version }}</a>

      <button :disabled="pending" @click="onLogout">
        Logout
      </button>
      <hr>
    </header>

    <main class="page">
      <!-- <nav v-if="auth.isLoggedIn">
        <ul>
          <li v-for="(breadcrumb, index) in breadcrumbs" :key="index">
            <NuxtLink v-if="index < breadcrumbs.length - 1" :to="breadcrumb.path">
              {{ breadcrumb.name }}
            </NuxtLink>
            <span v-else>{{ breadcrumb.name }}</span>
          </li>
        </ul>
      </nav> -->

      <NuxtPage />
    </main>
  </div>
</template>
