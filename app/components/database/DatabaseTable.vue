<script setup lang="ts">
import type { TAnyDatabaseDefinition, TDatabaseSchema, TFieldDef, TRow } from "~~/core";

import { getColumnFields, getRowTitle, isOptimisticRow } from "~~/core";



const props = defineProps<{
  definition: TAnyDatabaseDefinition;
  schema?: TDatabaseSchema | null;
  rows: Array<TRow>;
  /** Total rows matching the current search/filter (the table may render fewer). */
  total?: number;
  canCreate?: boolean;
}>();

const emit = defineEmits<{
  new: [];
}>();

/**
 * @description
 * Column widths by kind, Notion-like.
 */
const WIDTHS: Partial<Record<TFieldDef["kind"], number>> = {
  title: 280,
  select: 124,
  status: 132,
  multi_select: 160,
  number: 84,
  checkbox: 84,
  date: 128,
  url: 220,
  email: 200,
  rich_text: 220,
};

const columns = computed(() => getColumnFields(props.definition));
const titleKey = computed(() => props.definition.titleField);

function widthOf(field: TFieldDef): number {
  return WIDTHS[field.kind] ?? 160;
}

function coverOf(row: TRow): string | null {
  const key = props.definition.views?.gallery?.cover;
  const value = key ? row.values[key] : null;

  return typeof value === "string" && value ? value : row.cover;
}

function open(row: TRow, event: MouseEvent): void {
  if (isOptimisticRow(row) || (event.target as HTMLElement).closest("a, button")) {
    return;
  }

  navigateTo(`/d/${props.definition.slug}/${row.id}`);
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-max min-w-full table-fixed border-collapse text-sm" :aria-label="definition.title">
      <colgroup>
        <col v-for="field in columns" :key="field.key" :style="{ width: `${widthOf(field)}px` }">
        <col>
      </colgroup>

      <thead>
        <tr class="h-[34px] border-b border-default text-muted">
          <th
            v-for="(field, index) in columns"
            :key="field.key"
            scope="col"
            class="border-e border-default px-2 text-start font-normal"
            :class="{ 'ps-0.5': index === 0 }"
          >
            <span class="flex min-w-0 items-center gap-1.5">
              <UIcon :name="propertyIcon(field.kind)" class="size-3.5 shrink-0" />
              <span class="truncate">{{ field.label }}</span>
            </span>
          </th>
          <th aria-hidden="true" />
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="row in rows"
          :key="row.id"
          class="h-[37px] border-b border-default"
          :class="isOptimisticRow(row) ? 'opacity-80' : 'cursor-pointer hover:bg-hover'"
          @click="open(row, $event)"
        >
          <td
            v-for="(field, index) in columns"
            :key="field.key"
            class="max-w-0 border-e border-default px-2"
            :class="[{ 'ps-0.5': index === 0 }, field.kind === 'number' ? 'text-end' : '']"
          >
            <span v-if="field.key === titleKey" class="flex min-w-0 items-center gap-2">
              <Poster :src="coverOf(row)" :title="getRowTitle(definition, row)" :seed="row.id" class="h-[26px] w-[18px] shrink-0 rounded-[2px]" />
              <NuxtLink
                v-if="!isOptimisticRow(row)"
                :to="`/d/${definition.slug}/${row.id}`"
                class="focus-ring min-w-0 flex-1 truncate rounded-sm font-medium"
              >
                {{ getRowTitle(definition, row) || "Untitled" }}
              </NuxtLink>
              <span v-else class="min-w-0 flex-1 truncate font-medium">{{ getRowTitle(definition, row) || "Untitled" }}</span>
              <span v-if="isOptimisticRow(row)" class="inline-flex h-5 shrink-0 items-center gap-1 rounded-[3px] bg-accent-soft px-1.5 text-xs text-link">
                <UIcon name="i-lucide-refresh-cw" class="size-3 animate-spin" />
                Syncing
              </span>
            </span>
            <span v-else class="flex min-w-0 items-center" :class="{ 'justify-end': field.kind === 'number' }">
              <PropertyValue :field="field" :value="row.values[field.key] ?? null" :schema="schema" compact />
            </span>
          </td>
          <td />
        </tr>
      </tbody>
    </table>

    <button
      v-if="canCreate"
      type="button"
      class="focus-ring flex h-[34px] w-full items-center gap-2 border-b border-default px-0.5 text-muted hover:bg-hover"
      @click="emit('new')"
    >
      <UIcon name="i-lucide-plus" class="size-3.5" />
      New
    </button>

    <div class="flex h-[34px] items-center px-0.5 text-xs text-muted">
      Count <b class="ms-1 font-medium text-default">{{ total ?? rows.length }}</b>
    </div>
  </div>
</template>
