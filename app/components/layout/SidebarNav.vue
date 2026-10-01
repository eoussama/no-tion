<script lang="ts" setup>
import { useDatabasesQuery } from "~/queries";



defineProps<{
  collapsed?: boolean;
}>();

const emit = defineEmits<{
  search: [];
}>();

const route = useRoute();
const { data: databases, isPending, isError } = useDatabasesQuery();

const activeSlug = computed(() => "slug" in route.params ? String(route.params.slug) : undefined);

function rowClass(active: boolean): string {
  return active ? "bg-active text-default" : "";
}
</script>

<template>
  <nav aria-label="Main" class="flex flex-col gap-0.5">
    <button
      type="button"
      class="nav-row focus-ring w-full text-start"
      :class="{ 'justify-center px-0': collapsed }"
      :aria-label="collapsed ? 'Search' : undefined"
      aria-keyshortcuts="Control+K Meta+K"
      @click="emit('search')"
    >
      <UIcon name="i-lucide-search" class="size-4 shrink-0" />
      <template v-if="!collapsed">
        <span class="flex-1">Search</span>
        <span class="text-[11px] font-normal text-muted">Ctrl K</span>
      </template>
    </button>

    <NuxtLink
      to="/"
      class="nav-row focus-ring"
      :class="[rowClass(route.path === '/'), { 'justify-center px-0': collapsed }]"
      :aria-label="collapsed ? 'Home' : undefined"
    >
      <UIcon name="i-lucide-house" class="size-4 shrink-0" />
      <span v-if="!collapsed">Home</span>
    </NuxtLink>
  </nav>

  <nav aria-labelledby="sidebar-databases" class="mt-5 flex flex-col gap-0.5">
    <h2 id="sidebar-databases" class="px-2.5 pb-1.5 text-xs font-medium text-muted" :class="{ 'sr-only': collapsed }">
      Databases
    </h2>

    <template v-if="isPending && !databases">
      <USkeleton v-for="i in 3" :key="i" class="mx-2.5 my-1.5 h-4 bg-active" />
    </template>

    <p v-else-if="isError && !databases" class="px-2.5 text-xs text-muted">
      <template v-if="!collapsed">
        Unable to load databases
      </template>
    </p>

    <NuxtLink
      v-for="db in databases"
      :key="db.id"
      :to="`/d/${db.slug}`"
      class="nav-row focus-ring"
      :class="[rowClass(activeSlug === db.slug), { 'justify-center px-0': collapsed }]"
      :aria-label="collapsed ? db.title : undefined"
      :aria-current="activeSlug === db.slug ? 'page' : undefined"
    >
      <DbIcon :icon="db.icon" :size="16" />
      <span v-if="!collapsed" class="truncate">{{ db.title }}</span>
    </NuxtLink>
  </nav>
</template>
