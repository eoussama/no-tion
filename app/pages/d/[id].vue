<script lang="ts" setup>
const { name } = useRoute();
const { updatePage } = usePages();

const id = useRoute().params.id as string;
const res = useDatabaseApi().getCinemaTv();

res.then((e) => {
  const title = e.data.value?.data?.title ?? id ?? "Unknown Database";

  updatePage(name as string, { title, crumb: { label: title }, lazy: false });
});
</script>

<template>
  <p>Associated ID: <b>{{ id }}</b></p>

  <div>
    <p v-if="res?.pending.value" class="text-red-500">
      Fetching database info...
    </p>

    <p v-else-if="res?.error.value" class="text-red-500">
      {{ res.error.value }}
    </p>

    <ul v-else>
      <li v-for="row in res?.data.value?.data?.rows" :key="row.id">
        <a :href="row.url" target="_blank" class="text-blue-500 hover:underline">
          {{ row.title }}
        </a>

        <small class="text-sm text-gray-500">
          Type: {{ row.type }} | Genre: {{ row.genre }} | Franchises: {{ row.franchises.join(", ") }}
        </small>
      </li>
    </ul>
  </div>
</template>
