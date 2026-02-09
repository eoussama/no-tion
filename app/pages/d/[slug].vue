<script setup lang="ts">
import { registerPage } from "~~/core";


registerPage("Detail", { href: "/:slug" });
</script>

<template>
  <NuxtLink to="/">
    Go to home
  </NuxtLink>

  <p>Detail Page</p>
</template>
