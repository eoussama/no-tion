<script setup lang="ts">
import { findRegisteredDefinition, getRowTitle, isOptimisticRow } from "~~/core";
import { useCachedRows, useDatabasesQuery } from "~/queries";



useHead({ title: "Home" });

const { data: databases, isPending, isError, error, refetch } = useDatabasesQuery();
const cached = useCachedRows();
const now = useNow({ interval: 60_000 });
const NuxtLink = resolveComponent("NuxtLink");

const cards = computed(() => (databases.value ?? []).map((db) => {
  const definition = findRegisteredDefinition(db.slug);
  const lookup = definition?.lookup;

  return {
    db,
    emoji: definition?.icon,
    tone: TONE_BACKGROUNDS[toneOf(db.slug)],
    description: definition?.description ?? "Form generated from its Notion properties.",
    badge: definition ? lookup ? `Custom form · ${lookup.label}` : "Custom form" : "Generated form",
    custom: Boolean(definition),
    edited: db.lastEditedTime ? `Edited ${formatRelative(db.lastEditedTime, now.value.getTime())}` : "",
  };
}));

const recent = computed(() => cached.value.slice(0, 6).map(({ slug, row, definition, databaseTitle }) => ({
  id: row.id,
  to: isOptimisticRow(row) ? undefined : `/d/${slug}/${row.id}`,
  title: (definition ? getRowTitle(definition, row) : "") || "Untitled",
  cover: row.cover,
  databaseTitle,
  pending: isOptimisticRow(row),
  when: formatRelative(row.createdTime, now.value.getTime()),
})));
</script>

<template>
  <div class="mx-auto w-full max-w-[1248px] px-4 pt-10 pb-16 sm:px-12 lg:px-24 lg:pt-16">
    <h1 class="text-[32px] leading-tight font-bold tracking-[-0.01em] sm:text-[40px]">
      Home
    </h1>
    <p class="mt-1 text-muted">
      Every Notion database shared with the integration shows up here.
    </p>

    <h2 class="mt-9 mb-3 text-sm font-semibold text-muted">
      Databases
    </h2>

    <div v-if="isPending && !databases" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <USkeleton v-for="i in 3" :key="i" class="h-48 rounded-[10px]" />
    </div>

    <div v-else-if="isError && !databases" role="alert" class="flex flex-wrap items-center gap-3 rounded-md bg-tag-red px-3 py-2.5 text-[13px] text-tag-text">
      <UIcon name="i-lucide-circle-alert" class="size-4 shrink-0" />
      <span class="flex-1">Unable to load databases: {{ getErrorMessage(error) }}</span>
      <UButton color="neutral" variant="outline" size="sm" label="Retry" @click="refetch()" />
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <NuxtLink
        v-for="card in cards"
        :key="card.db.id"
        :to="`/d/${card.db.slug}`"
        class="focus-ring flex flex-col overflow-hidden rounded-[10px] bg-card shadow-card transition-colors hover:bg-hover"
      >
        <div class="h-16" :class="card.tone" aria-hidden="true" />
        <div class="flex flex-1 flex-col gap-1 px-4 pb-4">
          <span class="-mt-5 flex size-10 items-center justify-center rounded-lg bg-card shadow-card">
            <DbIcon :icon="card.db.icon" :emoji="card.emoji" :size="20" />
          </span>
          <span class="mt-2 truncate text-[15px] font-semibold">{{ card.db.title }}</span>
          <span class="line-clamp-2 text-[13px] text-muted">{{ card.description }}</span>
          <span class="mt-auto flex items-center gap-2 pt-2.5">
            <span class="inline-flex h-5 items-center rounded-[3px] px-1.5 text-xs whitespace-nowrap" :class="card.custom ? 'bg-accent-soft text-link' : 'bg-tag-gray text-tag-text'">{{ card.badge }}</span>
            <span class="truncate text-xs text-muted">{{ card.edited }}</span>
          </span>
        </div>
      </NuxtLink>

      <div class="flex flex-col justify-center gap-2 rounded-[10px] border border-dashed border-faint p-5 text-muted">
        <UIcon name="i-lucide-plus" class="size-5" />
        <span class="text-[15px] font-semibold text-default">Connect a database</span>
        <span class="text-[13px]">Share it with the integration in Notion. It appears here with a form built from its properties.</span>
      </div>
    </div>

    <template v-if="recent.length">
      <h2 class="mt-10 mb-1 text-sm font-semibold text-muted">
        Recently added
      </h2>

      <ul>
        <li v-for="item in recent" :key="item.id" class="border-b border-default">
          <component
            :is="item.to ? NuxtLink : 'div'"
            :to="item.to"
            class="focus-ring flex h-11 items-center gap-3 rounded-sm px-0.5"
            :class="{ 'hover:bg-hover': item.to }"
          >
            <Poster :src="item.cover" :title="item.title" :seed="item.id" class="h-7 w-5 shrink-0 rounded-[2px]" />
            <span class="truncate font-medium">{{ item.title }}</span>
            <span class="hidden truncate text-[13px] text-muted sm:inline">in {{ item.databaseTitle }}</span>
            <span class="flex-1" />
            <span v-if="item.pending" class="inline-flex h-5 items-center gap-1 rounded-[3px] bg-accent-soft px-1.5 text-xs text-link">
              <UIcon name="i-lucide-refresh-cw" class="size-3 animate-spin" />
              Syncing
            </span>
            <span class="w-28 shrink-0 text-end text-[13px] text-muted">{{ item.when }}</span>
          </component>
        </li>
      </ul>
    </template>
  </div>
</template>
