<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { TFieldDef, TPropertyValue, TRow, TViewMode } from "~~/core";

import { getColumnFields, getFormFields, resolveOptions } from "~~/core";
import { useDatabaseDefinition, useRowsQuery } from "~/queries";



type TSort = { key: string; direction: "asc" | "desc" };
type TFilter = { key: string; value: string };
type TCreateMode = "auto" | "manual";

const PAGE_SIZE = 120;

const route = useRoute("d-slug");
const slug = computed(() => route.params.slug);

const { definition, schema, meta, isError: isInfoError, error: infoError } = useDatabaseDefinition(slug);
const { data, isPending, isError, error, refetch } = useRowsQuery(slug);

const rows = computed(() => data.value?.rows ?? []);

const creating = ref(false);
const createMode = ref<TCreateMode>("auto");

const searchOpen = ref(false);
const search = ref("");
const sort = ref<TSort | null>(null);
const filters = ref<Array<TFilter>>([]);
const limit = ref(PAGE_SIZE);

watch(slug, () => {
  search.value = "";
  searchOpen.value = false;
  sort.value = null;
  filters.value = [];
});

watch([search, sort, filters, slug], () => {
  limit.value = PAGE_SIZE;
});

const views = useLocalStorage<Record<string, TViewMode>>("no-tion:views", {});
const view = computed<TViewMode>({
  get: () => views.value[slug.value] ?? definition.value?.views?.default ?? "table",
  set: (value) => {
    views.value = { ...views.value, [slug.value]: value };
  },
});

const viewItems = [
  { label: "Gallery", value: "gallery", icon: "i-lucide-layout-grid" },
  { label: "Table", value: "table", icon: "i-lucide-table" },
] as const;

const columns = computed(() => definition.value ? getColumnFields(definition.value) : []);
const filterableFields = computed(() => columns.value.filter(field => ["select", "status", "multi_select"].includes(field.kind)));
const sortableFields = computed(() => columns.value.filter(field => !["multi_select", "relation", "people", "files"].includes(field.kind)));

function asText(value: TPropertyValue | undefined): string {
  return Array.isArray(value) ? value.join(" ") : value === null || value === undefined ? "" : String(value);
}

function matches(row: TRow, filter: TFilter): boolean {
  const value = row.values[filter.key];

  return Array.isArray(value) ? value.includes(filter.value) : value === filter.value;
}

function isBlank(value: TPropertyValue | undefined): boolean {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

function compare(a: TPropertyValue | undefined, b: TPropertyValue | undefined): number {
  const emptyA = isBlank(a);
  const emptyB = isBlank(b);

  if (emptyA || emptyB) {
    return emptyA === emptyB ? 0 : emptyA ? 1 : -1;
  }

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return asText(a).localeCompare(asText(b), undefined, { numeric: true, sensitivity: "base" });
}

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase();
  let result = rows.value;

  if (term) {
    result = result.filter(row => Object.values(row.values).some(value => asText(value).toLowerCase().includes(term)));
  }

  for (const filter of filters.value) {
    result = result.filter(row => matches(row, filter));
  }

  const current = sort.value;

  if (current) {
    const factor = current.direction === "asc" ? 1 : -1;

    result = [...result].sort((a, b) => {
      const order = compare(a.values[current.key], b.values[current.key]);

      // Empty values stay last whatever the direction.
      return isBlank(a.values[current.key]) || isBlank(b.values[current.key]) ? order : order * factor;
    });
  }

  return result;
});

const visibleRows = computed(() => filteredRows.value.slice(0, limit.value));

const canCreate = computed(() => Boolean(definition.value && getFormFields(definition.value).length > 0));
const title = computed(() => meta.value?.title ?? definition.value?.title ?? "Database");
const description = computed(() => definition.value?.description);
const lookup = computed(() => definition.value?.lookup);

useHead({ title });

function fieldLabel(key: string): string {
  return columns.value.find(field => field.key === key)?.label ?? key;
}

function toggleFilter(field: TFieldDef, value: string): void {
  const exists = filters.value.some(filter => filter.key === field.key && filter.value === value);

  filters.value = exists
    ? filters.value.filter(filter => !(filter.key === field.key && filter.value === value))
    : [...filters.value, { key: field.key, value }];
}

const filterItems = computed<Array<Array<DropdownMenuItem>>>(() => [
  [{ type: "label", label: "Filter by" }],
  filterableFields.value.map(field => ({
    label: field.label,
    icon: propertyIcon(field.kind),
    children: resolveOptions(field, schema.value).map(option => ({
      type: "checkbox" as const,
      label: option.name,
      checked: filters.value.some(filter => filter.key === field.key && filter.value === option.name),
      onUpdateChecked: () => toggleFilter(field, option.name),
      onSelect: (event: Event) => event.preventDefault(),
    })),
  })),
  ...(filters.value.length ? [[{ label: "Clear filters", icon: "i-lucide-x", onSelect: () => (filters.value = []) }]] : []),
]);

const sortItems = computed<Array<Array<DropdownMenuItem>>>(() => [
  [{ type: "label", label: "Sort by" }],
  sortableFields.value.map(field => ({
    type: "checkbox" as const,
    label: field.label,
    icon: sort.value?.key === field.key ? sort.value.direction === "asc" ? "i-lucide-arrow-up" : "i-lucide-arrow-down" : propertyIcon(field.kind),
    checked: sort.value?.key === field.key,
    onUpdateChecked: () => {
      sort.value = sort.value?.key === field.key
        ? sort.value.direction === "asc" ? { key: field.key, direction: "desc" } : null
        : { key: field.key, direction: "asc" };
    },
  })),
  ...(sort.value ? [[{ label: "Default order", icon: "i-lucide-x", onSelect: () => (sort.value = null) }]] : []),
]);

const newItems = computed<Array<DropdownMenuItem>>(() => lookup.value
  ? [
      { label: `Auto · ${lookup.value.label}`, icon: "i-lucide-sparkles", onSelect: () => openCreate("auto") },
      { label: "Manual entry", icon: "i-lucide-pencil", onSelect: () => openCreate("manual") },
    ]
  : []);

function openCreate(mode: TCreateMode = lookup.value ? "auto" : "manual"): void {
  createMode.value = mode;
  creating.value = true;
}

const searchInput = useTemplateRef<{ inputRef?: HTMLInputElement }>("searchInput");

async function openSearch(): Promise<void> {
  searchOpen.value = true;
  await nextTick();
  searchInput.value?.inputRef?.focus();
}

function closeSearch(): void {
  search.value = "";
  searchOpen.value = false;
}

const moreItems = computed<Array<Array<DropdownMenuItem>>>(() => [
  meta.value?.url ? [{ label: "Open in Notion", icon: "i-lucide-external-link", to: meta.value.url, target: "_blank" }] : [],
].filter(group => group.length > 0));

defineShortcuts({
  n: () => canCreate.value && !creating.value && openCreate(),
});
</script>

<template>
  <div class="px-4 pt-6 pb-16 sm:px-12 lg:px-24 lg:pt-13">
    <Teleport defer to="#navbar-actions">
      <UDropdownMenu v-if="moreItems.length > 0" :items="moreItems" :content="{ align: 'end' }">
        <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-ellipsis" aria-label="More actions" />
      </UDropdownMenu>
    </Teleport>

    <header>
      <DbIcon :icon="meta?.icon" :emoji="definition?.icon" :size="56" class="hidden sm:inline-flex" />
      <h1 class="mt-2.5 mb-1 text-[28px] leading-tight font-bold tracking-[-0.01em] sm:text-[40px]">
        {{ title }}
      </h1>
      <p v-if="description" class="text-muted">
        {{ description }}
      </p>
    </header>

    <div class="mt-4 flex h-10 items-end gap-4 border-b border-default sm:mt-7">
      <TabSwitch v-model="view" :items="viewItems" label="View" />

      <div class="ms-auto flex h-[38px] min-w-0 items-center gap-0.5">
        <UInput
          v-if="searchOpen"
          ref="searchInput"
          v-model="search"
          size="sm"
          icon="i-lucide-search"
          placeholder="Type to search..."
          aria-label="Search rows"
          class="w-36 sm:w-52"
          @keydown.esc="closeSearch"
        >
          <template #trailing>
            <UButton color="neutral" variant="link" size="xs" icon="i-lucide-x" aria-label="Close search" class="text-muted" @click="closeSearch" />
          </template>
        </UInput>

        <UDropdownMenu v-if="filterableFields.length" :items="filterItems" :content="{ align: 'end' }">
          <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-list-filter" aria-label="Filter" :class="filters.length ? 'text-link' : 'text-muted'" />
        </UDropdownMenu>

        <UDropdownMenu :items="sortItems" :content="{ align: 'end' }">
          <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-arrow-up-down" aria-label="Sort" :class="sort ? 'text-link' : 'text-muted'" />
        </UDropdownMenu>

        <UButton v-if="!searchOpen" color="neutral" variant="ghost" size="sm" icon="i-lucide-search" aria-label="Search rows" class="text-muted" @click="openSearch" />

        <UFieldGroup v-if="canCreate" class="ms-1.5">
          <UButton size="sm" icon="i-lucide-plus" label="New" aria-keyshortcuts="N" @click="openCreate()" />
          <UDropdownMenu v-if="newItems.length" :items="newItems" :content="{ align: 'end' }">
            <UButton size="sm" icon="i-lucide-chevron-down" aria-label="More ways to add" class="border-s border-white/30 px-1.5" />
          </UDropdownMenu>
        </UFieldGroup>
      </div>
    </div>

    <div v-if="filters.length || sort" class="flex flex-wrap items-center gap-1.5 pt-2.5">
      <button
        v-for="filter in filters"
        :key="`${filter.key}:${filter.value}`"
        type="button"
        class="focus-ring inline-flex h-6 items-center gap-1 rounded-full bg-accent-soft px-2.5 text-xs text-link hover:opacity-80"
        :aria-label="`Remove filter ${fieldLabel(filter.key)}: ${filter.value}`"
        @click="filters = filters.filter(item => item !== filter)"
      >
        {{ fieldLabel(filter.key) }}: {{ filter.value }}
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
      <button
        v-if="sort"
        type="button"
        class="focus-ring inline-flex h-6 items-center gap-1 rounded-full bg-accent-soft px-2.5 text-xs text-link hover:opacity-80"
        aria-label="Remove sort"
        @click="sort = null"
      >
        <UIcon :name="sort.direction === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-3" />
        {{ fieldLabel(sort.key) }}
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
    </div>

    <div class="pt-4">
      <div
        v-if="(isError || isInfoError) && !data"
        role="alert"
        class="flex flex-wrap items-center gap-3 rounded-md bg-tag-red px-3 py-2.5 text-[13px] text-tag-text"
      >
        <UIcon name="i-lucide-circle-alert" class="size-4 shrink-0" />
        <span class="flex-1">Unable to load this database: {{ getErrorMessage(error ?? infoError) }}</span>
        <UButton color="neutral" variant="outline" size="sm" label="Retry" @click="refetch()" />
      </div>

      <div v-else-if="isPending || !definition" aria-busy="true" aria-label="Loading rows">
        <div v-if="view === 'gallery'" class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 sm:gap-4">
          <USkeleton v-for="i in 12" :key="i" class="aspect-[2/3] rounded-md" />
        </div>
        <div v-else class="flex flex-col">
          <USkeleton v-for="i in 10" :key="i" class="my-2 h-5" />
        </div>
      </div>

      <div v-else-if="!filteredRows.length" class="flex flex-col items-center gap-2 py-16 text-center text-muted">
        <UIcon :name="rows.length ? 'i-lucide-search-x' : 'i-lucide-inbox'" class="size-6" />
        <p>{{ rows.length ? "No entries match." : "No entries yet." }}</p>
        <UButton v-if="!rows.length && canCreate" size="sm" icon="i-lucide-plus" label="Add the first one" @click="openCreate()" />
      </div>

      <template v-else>
        <DatabaseGallery v-if="view === 'gallery'" :definition="definition" :schema="schema" :rows="visibleRows" />
        <div v-else class="-me-4 sm:-me-12 lg:-me-24">
          <DatabaseTable :definition="definition" :schema="schema" :rows="visibleRows" :total="filteredRows.length" :can-create="canCreate" @new="openCreate()" />
        </div>

        <div v-if="filteredRows.length > visibleRows.length" class="flex justify-center pt-6">
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            :label="`Load more (${filteredRows.length - visibleRows.length} left)`"
            @click="limit += PAGE_SIZE"
          />
        </div>
      </template>
    </div>

    <DatabaseFormSlideover
      v-if="definition"
      v-model:open="creating"
      :mode="createMode"
      :definition="definition"
      :schema="schema"
      :rows="rows"
    />
  </div>
</template>
