<script setup lang="ts">
import type { TAnyDatabaseDefinition, TDatabaseSchema, TRow } from "~~/core";

import { getField, getRowTitle, isOptimisticRow } from "~~/core";



const props = defineProps<{
  definition: TAnyDatabaseDefinition;
  schema?: TDatabaseSchema | null;
  rows: Array<TRow>;
}>();

const NuxtLink = resolveComponent("NuxtLink");

const badgeFields = computed(() => (props.definition.views?.gallery?.badges ?? [])
  .map(key => getField(props.definition, key))
  .filter(field => field !== undefined));

function coverOf(row: TRow): string | null {
  const key = props.definition.views?.gallery?.cover;
  const value = key ? row.values[key] : null;

  return typeof value === "string" && value ? value : row.cover;
}

function subtitleOf(row: TRow): string {
  return props.definition.views?.gallery?.subtitle?.(row.values) ?? "";
}
</script>

<template>
  <ul class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 sm:gap-4" :aria-label="`${definition.title} entries`">
    <li v-for="row in rows" :key="row.id" class="min-w-0">
      <component
        :is="isOptimisticRow(row) ? 'div' : NuxtLink"
        :to="isOptimisticRow(row) ? undefined : `/d/${definition.slug}/${row.id}`"
        class="focus-ring group flex h-full flex-col overflow-hidden rounded-md bg-card shadow-card transition-colors"
        :class="isOptimisticRow(row) ? 'opacity-80' : 'hover:bg-hover'"
      >
        <Poster
          :src="coverOf(row)"
          :title="getRowTitle(definition, row)"
          :seed="row.id"
          :monogram-size="30"
          class="aspect-[2/3] w-full transition-opacity group-hover:opacity-95"
        />

        <div class="flex min-w-0 flex-col gap-1.5 px-2.5 pt-2 pb-2.5">
          <div class="flex min-w-0 items-center gap-1.5">
            <span class="min-w-0 flex-1 truncate font-semibold" :title="getRowTitle(definition, row)">
              {{ getRowTitle(definition, row) || "Untitled" }}
            </span>
            <span v-if="isOptimisticRow(row)" class="inline-flex text-dot-blue" title="Not synced yet">
              <UIcon name="i-lucide-refresh-cw" class="size-[13px] animate-spin" aria-label="Syncing" />
            </span>
          </div>

          <div v-if="badgeFields.length" class="flex min-w-0 flex-wrap gap-1">
            <PropertyValue v-for="field in badgeFields" :key="field.key" :field="field" :value="row.values[field.key] ?? null" :schema="schema" compact />
          </div>

          <span v-if="subtitleOf(row)" class="truncate text-xs text-muted">{{ subtitleOf(row) }}</span>
        </div>
      </component>
    </li>
  </ul>
</template>
