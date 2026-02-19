<script setup lang="ts">
import { useDatabaseApi } from "~/composables/database.composable";



const res = useDatabaseApi().all();
</script>

<template>
  <h2>Databases</h2>

  <div>
    <p v-if="res?.pending.value" class="text-red-500">
      Fetching databases...
    </p>

    <p v-else-if="res?.error.value" class="text-red-500">
      {{ res.error.value }}
    </p>

    <ul v-else>
      <li v-for="(db, index) in res?.data.value?.data" :key="index">
        <NuxtLink :to="`/d/${db.id}`">
          {{ db.title }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
