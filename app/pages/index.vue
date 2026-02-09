<script setup lang="ts">
import { registerPage } from "~~/core";



registerPage("Home", { href: "/" });
</script>

<template>
  <p>Welcome to the home page!</p>
  <NuxtLink to="/cinema-tv">
    Cinema & TV
  </NuxtLink>
</template>
