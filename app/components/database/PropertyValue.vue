<script setup lang="ts">
import type { TDatabaseSchema, TFieldDef, TNotionColor, TPropertyValue } from "~~/core";

import { resolveOptions } from "~~/core";



const props = defineProps<{
  field: TFieldDef;
  value: TPropertyValue;
  schema?: TDatabaseSchema | null;
  /** Compact rendering for table cells and cards (links show the host only). */
  compact?: boolean;
  /** Show a faint "Empty" placeholder when there is no value. */
  showEmpty?: boolean;
}>();

const colors = computed(() => new Map(resolveOptions(props.field, props.schema).map(option => [option.name, option.color])));

function colorOf(name: string): TNotionColor {
  return colors.value.get(name) ?? "default";
}

const list = computed(() => Array.isArray(props.value) ? props.value : []);

const text = computed(() => {
  const value = props.value;

  if (value === null || value === undefined || Array.isArray(value) || typeof value === "boolean") {
    return "";
  }

  if (["date", "created_time", "last_edited_time"].includes(props.field.kind)) {
    const date = new Date(String(value));

    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  return String(value);
});

const isEmpty = computed(() => props.field.kind !== "checkbox" && (Array.isArray(props.value) ? props.value.length === 0 : text.value === ""));
const isLink = computed(() => (props.field.kind === "url" || props.field.kind === "cover") && /^https?:\/\//.test(text.value));
const linkLabel = computed(() => props.compact ? shortUrl(text.value).split("/")[0] ?? text.value : shortUrl(text.value));
</script>

<template>
  <span v-if="isEmpty && showEmpty" class="text-faint">Empty</span>

  <template v-else-if="isEmpty" />

  <NotionTag v-else-if="field.kind === 'select'" :name="text" :color="colorOf(text)" />

  <NotionTag v-else-if="field.kind === 'status'" :name="text" :color="colorOf(text)" variant="status" />

  <span v-else-if="field.kind === 'multi_select'" class="inline-flex min-w-0 flex-wrap gap-1" :class="{ 'flex-nowrap overflow-hidden': compact }">
    <NotionTag v-for="name in list" :key="name" :name="name" :color="colorOf(name)" />
  </span>

  <UIcon
    v-else-if="field.kind === 'checkbox'"
    :name="value ? 'i-lucide-square-check' : 'i-lucide-square'"
    class="size-4"
    :class="value ? 'text-link' : 'text-muted'"
    :aria-label="value ? 'Checked' : 'Not checked'"
  />

  <a
    v-else-if="isLink"
    :href="text"
    target="_blank"
    rel="noopener noreferrer"
    class="focus-ring truncate rounded-sm underline decoration-faint underline-offset-[3px] hover:decoration-current"
    :class="compact ? 'text-muted' : 'text-default'"
    @click.stop
  >{{ linkLabel }}</a>

  <a
    v-else-if="field.kind === 'email'"
    :href="`mailto:${text}`"
    class="focus-ring truncate rounded-sm underline decoration-faint underline-offset-[3px]"
    @click.stop
  >{{ text }}</a>

  <span v-else-if="Array.isArray(value)" class="truncate">{{ list.join(", ") }}</span>

  <span v-else class="truncate" :class="{ 'tabular-nums': field.kind === 'number', 'font-medium': field.kind === 'title' }">{{ text }}</span>
</template>
