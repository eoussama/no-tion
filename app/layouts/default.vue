<script lang="ts" setup>
import pkg from "~/../package.json";

import Breadcrumb from "~/components/layout/Breadcrumb.vue";
import Title from "~/components/layout/Title.vue";
import Workspace from "~/components/layout/Workspace.vue";



const auth = useAuthStore();

const logoutRequest = useAsyncData("logout", () => useAuthApi().logout(), { immediate: false, server: false });
const { pending } = logoutRequest;

function onLogout(): void {
  logoutRequest.execute();
}
</script>

<template>
  <header>
    no-tion

    <Workspace />

    <a href="http://git.ouss.es/no-tion" target="_blank">{{ pkg.version }}</a>

    <button v-if="auth.isLoggedIn" :disabled="pending" @click="onLogout">
      Logout
    </button>
    <hr>
  </header>

  <main class="page">
    <Breadcrumb />
    <Title />

    <slot />
  </main>
</template>
