<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";
import type { TFieldDef, TNotionColor, TPropertyValue, TSelectOption, TStatusGroup } from "~~/core";

import { allowsNewOptions } from "~~/core";



type TOptionItem = { label: string; value: string; color: TNotionColor };

const props = withDefaults(defineProps<{
  field: TFieldDef;
  value: TPropertyValue;
  options?: Array<TSelectOption>;
  /** Status groups (To-do, In progress, Complete), to section the status menu. */
  groups?: Array<TStatusGroup>;
  readonly?: boolean;
  placeholder?: string;
  invalid?: boolean;
  id?: string;
  /** Open the select menus right away (inline editing). */
  autoOpen?: boolean;
}>(), {
  options: () => [],
  groups: () => [],
  placeholder: undefined,
  id: undefined,
});

const emit = defineEmits<{
  "update:value": [value: TPropertyValue];
  "blur": [];
}>();

const created = ref<Array<TSelectOption>>([]);

const allOptions = computed<Array<TOptionItem>>(() => [...props.options, ...created.value].map(option => ({ label: option.name, value: option.name, color: option.color })));

/** Status options sectioned by group, Notion-like; other kinds get a flat list. */
const items = computed<Array<SelectMenuItem> | Array<Array<SelectMenuItem>>>(() => {
  if (props.field.kind !== "status" || props.groups.length === 0) {
    return allOptions.value;
  }

  const byId = new Map(props.options.map(option => [option.id, option.name]));

  return props.groups
    .map(group => [
      { type: "label" as const, label: group.name },
      ...group.optionIds
        .map(id => allOptions.value.find(option => option.value === byId.get(id)))
        .filter(option => option !== undefined),
    ])
    .filter(group => group.length > 1);
});

const colorOf = (name: string): TNotionColor => allOptions.value.find(option => option.value === name)?.color ?? "default";

const canCreate = computed(() => !props.readonly && allowsNewOptions(props.field));

const stringValue = computed(() => typeof props.value === "string" ? props.value : props.value === null || props.value === undefined ? "" : String(props.value));
const listValue = computed(() => Array.isArray(props.value) ? props.value : []);
const dateValue = computed(() => stringValue.value.slice(0, 10));
const emptyLabel = computed(() => props.placeholder ?? "Empty");

const isLink = computed(() => props.field.kind === "url" || props.field.kind === "cover");
const canOpen = computed(() => isLink.value && /^https?:\/\//.test(stringValue.value));

const menuOpen = ref(Boolean(props.autoOpen));

function update(value: TPropertyValue): void {
  emit("update:value", value);
}

function onNumber(raw: string | number): void {
  const text = String(raw).trim();
  const num = Number(text);

  update(text === "" || !Number.isFinite(num) ? null : num);
}

function onCreate(name: string): void {
  const trimmed = name.trim();

  if (!trimmed) {
    return;
  }

  if (!allOptions.value.some(item => item.value === trimmed)) {
    created.value.push({ id: trimmed, name: trimmed, color: "default" });
  }

  update(props.field.kind === "multi_select" ? [...listValue.value, trimmed] : trimmed);
}

const menuUi = computed(() => ({
  base: ["min-h-8 py-1", props.invalid ? "ring-error" : ""].join(" "),
  value: "flex min-w-0",
  content: "max-h-[min(24rem,var(--reka-combobox-content-available-height,24rem))]",
}));
</script>

<template>
  <USelectMenu
    v-if="field.kind === 'select' || field.kind === 'status'"
    :id="id"
    v-model:open="menuOpen"
    class="w-full"
    value-key="value"
    :items="items"
    :disabled="readonly"
    :placeholder="emptyLabel"
    :create-item="canCreate"
    :search-input="{ placeholder: 'Search for an option...' }"
    :model-value="stringValue || undefined"
    :ui="menuUi"
    @create="onCreate"
    @blur="emit('blur')"
    @update:model-value="(selected: string | undefined) => update(selected ?? null)"
  >
    <template v-if="stringValue" #default>
      <NotionTag :name="stringValue" :color="colorOf(stringValue)" :variant="field.kind === 'status' ? 'status' : 'tag'" />
    </template>
    <template #item-label="{ item }">
      <NotionTag :name="(item as TOptionItem).label" :color="(item as TOptionItem).color" :variant="field.kind === 'status' ? 'status' : 'tag'" />
    </template>
  </USelectMenu>

  <USelectMenu
    v-else-if="field.kind === 'multi_select'"
    :id="id"
    v-model:open="menuOpen"
    multiple
    class="w-full"
    value-key="value"
    :items="items"
    :disabled="readonly"
    :placeholder="emptyLabel"
    :create-item="canCreate ? 'always' : false"
    :search-input="{ placeholder: 'Search or create an option...' }"
    :model-value="listValue"
    :ui="menuUi"
    @create="onCreate"
    @blur="emit('blur')"
    @update:model-value="(selected: Array<string>) => update(selected)"
  >
    <template v-if="listValue.length" #default>
      <span class="flex min-w-0 flex-wrap gap-1">
        <NotionTag v-for="name in listValue" :key="name" :name="name" :color="colorOf(name)" />
      </span>
    </template>
    <template #item-label="{ item }">
      <NotionTag :name="(item as TOptionItem).label" :color="(item as TOptionItem).color" />
    </template>
  </USelectMenu>

  <div v-else-if="field.kind === 'checkbox'" class="flex h-8 items-center px-2.5">
    <UCheckbox
      :id="id"
      :disabled="readonly"
      :model-value="value === true"
      :aria-label="field.label"
      @update:model-value="(checked: boolean | 'indeterminate') => update(checked === true)"
    />
  </div>

  <UInput
    v-else-if="field.kind === 'number'"
    :id="id"
    class="w-full"
    type="number"
    inputmode="decimal"
    :readonly="readonly"
    :placeholder="emptyLabel"
    :highlight="invalid"
    :color="invalid ? 'error' : undefined"
    :model-value="typeof value === 'number' ? value : undefined"
    @blur="emit('blur')"
    @update:model-value="onNumber"
  />

  <UInput
    v-else-if="field.kind === 'date'"
    :id="id"
    class="w-full"
    type="date"
    :readonly="readonly"
    :highlight="invalid"
    :color="invalid ? 'error' : undefined"
    :model-value="dateValue"
    @blur="emit('blur')"
    @update:model-value="(date: string | number) => update(String(date) || null)"
  />

  <UTextarea
    v-else-if="field.kind === 'rich_text'"
    :id="id"
    class="w-full"
    autoresize
    :rows="1"
    :readonly="readonly"
    :placeholder="emptyLabel"
    :highlight="invalid"
    :color="invalid ? 'error' : undefined"
    :model-value="stringValue"
    @blur="emit('blur')"
    @update:model-value="(text: string) => update(text)"
  />

  <UInput
    v-else
    :id="id"
    class="w-full"
    :type="isLink ? 'url' : field.kind === 'email' ? 'email' : field.kind === 'phone_number' ? 'tel' : 'text'"
    :readonly="readonly"
    :placeholder="emptyLabel"
    :highlight="invalid"
    :color="invalid ? 'error' : undefined"
    :model-value="stringValue"
    :ui="canOpen ? { trailing: 'pe-1' } : undefined"
    @blur="emit('blur')"
    @update:model-value="(text: string | number) => update(String(text))"
  >
    <template v-if="canOpen" #trailing>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-lucide-external-link"
        aria-label="Open link in a new tab"
        class="text-muted"
        :to="stringValue"
        target="_blank"
      />
    </template>
  </UInput>
</template>
