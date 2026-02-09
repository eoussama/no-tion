<script setup lang="ts">
import { registerPage } from "~~/core";



registerPage("Home", { href: "/" });
const links = ["cinema-tv", "books", "music"];
</script>

<template>
  <p>Welcome to the home page!</p>

  <ul>
    <li v-for="(link, index) in links" :key="index">
      <NuxtLink :to="`/d/${link}`">{{ link }}</NuxtLink>
    </li>
  </ul>
</template>
