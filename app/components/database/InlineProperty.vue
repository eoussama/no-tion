<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";
import type { TDatabaseSchema, TFieldDef, TNotionColor, TPropertyValue } from "~~/core";

import { isFormField, resolveOptions } from "~~/core";



/**
 * @description
 * A row property shown as its value; click to edit in place (Notion-like). Selects open their menu directly,
 * checkboxes toggle, everything else edits in a popover (Enter or click outside saves, Escape cancels).
 */
const props = defineProps<{
  field: TFieldDef;
  value: TPropertyValue;
  schema?: TDatabaseSchema | null;
  /** Validates a single value (from the definition's input schema); returns an error message. */
  validate?: (value: TPropertyValue) => string | undefined;
  labelId?: string;
}>();

const emit = defineEmits<{
  save: [value: TPropertyValue];
}>();

const editable = computed(() => isFormField(props.field) && props.field.kind !== "cover");
const options = computed(() => resolveOptions(props.field, props.schema));
const groups = computed(() => props.field.property ? props.schema?.properties[props.field.property]?.groups ?? [] : []);

type TOptionItem = { label: string; value: string; color: TNotionColor };

const optionItems = computed<Array<TOptionItem>>(() => options.value.map(option => ({ label: option.name, value: option.name, color: option.color })));

/** Status options sectioned by group (To-do, In progress, Complete), like Notion. */
const menuItems = computed<Array<SelectMenuItem> | Array<Array<SelectMenuItem>>>(() => {
  if (props.field.kind !== "status" || groups.value.length === 0) {
    return optionItems.value;
  }

  return groups.value
    .map(group => [
      { type: "label" as const, label: group.name },
      ...group.optionIds
        .map(id => options.value.find(option => option.id === id))
        .filter(option => option !== undefined)
        .map(option => ({ label: option.name, value: option.name, color: option.color })),
    ])
    .filter(group => group.length > 1);
});

const open = ref(false);
const draft = ref<TPropertyValue>(null);
const menuOpen = ref(false);

/** Multi-selects edit a draft while the menu is open (one write on close); single selects write on pick. */
const menuValue = computed(() => props.field.kind === "multi_select"
  ? menuOpen.value && Array.isArray(draft.value) ? draft.value : Array.isArray(props.value) ? props.value : []
  : typeof props.value === "string" && props.value ? props.value : undefined);

const isMenu = computed(() => ["select", "status", "multi_select"].includes(props.field.kind));

const error = ref<string | undefined>(undefined);

function same(a: TPropertyValue, b: TPropertyValue): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function commit(value: TPropertyValue): boolean {
  const message = props.validate?.(value);

  if (message) {
    error.value = message;

    return false;
  }

  error.value = undefined;

  if (!same(value, props.value)) {
    emit("save", value);
  }

  return true;
}

watch(open, (isOpen, wasOpen) => {
  if (isOpen) {
    draft.value = props.value;
    error.value = undefined;
  }
  else if (wasOpen && !isMenu.value && !commit(draft.value)) {
    // Invalid on close: keep the stored value.
    error.value = undefined;
  }
});

function onMenuUpdate(value: TPropertyValue): void {
  if (props.field.kind === "multi_select") {
    draft.value = value;

    return;
  }

  commit(value);
}

function onMenuOpen(isOpen: boolean): void {
  menuOpen.value = isOpen;

  if (props.field.kind !== "multi_select") {
    return;
  }

  if (isOpen) {
    draft.value = props.value;
  }
  else {
    commit(draft.value);
  }
}

function onSubmit(): void {
  if (commit(draft.value)) {
    open.value = false;
  }
}

function cancel(): void {
  draft.value = props.value;
  error.value = undefined;
  open.value = false;
}
</script>

<template>
  <div v-if="!editable" class="flex min-h-8 min-w-0 items-center px-2" :aria-labelledby="labelId">
    <PropertyValue :field="field" :value="value" :schema="schema" show-empty />
  </div>

  <div v-else-if="field.kind === 'checkbox'" class="flex min-h-8 items-center px-2">
    <UCheckbox :model-value="value === true" :aria-labelledby="labelId" @update:model-value="(checked: boolean | 'indeterminate') => commit(checked === true)" />
  </div>

  <USelectMenu
    v-else-if="isMenu"
    variant="ghost"
    value-key="value"
    class="w-full"
    :multiple="field.kind === 'multi_select'"
    :items="menuItems"
    :model-value="menuValue as never"
    :search-input="{ placeholder: 'Search for an option...' }"
    :create-item="field.kind === 'multi_select'"
    :trailing-icon="false"
    :aria-labelledby="labelId"
    :ui="{ base: 'min-h-8 py-1 px-2 rounded-sm hover:bg-hover data-[state=open]:bg-hover', value: 'flex min-w-0', content: 'max-h-[min(24rem,var(--reka-combobox-content-available-height,24rem))] w-72' }"
    :content="{ align: 'start' }"
    @update:open="onMenuOpen"
    @update:model-value="(next: unknown) => onMenuUpdate(next as TPropertyValue)"
    @create="(name: string) => onMenuUpdate([...(Array.isArray(draft) ? draft : Array.isArray(value) ? value : []), name.trim()].filter(Boolean))"
  >
    <template #default>
      <PropertyValue :field="field" :value="field.kind === 'multi_select' && menuOpen ? draft : value" :schema="schema" show-empty />
    </template>
    <template #item-label="{ item }">
      <NotionTag :name="(item as TOptionItem).label" :color="(item as TOptionItem).color" :variant="field.kind === 'status' ? 'status' : 'tag'" />
    </template>
  </USelectMenu>

  <UPopover v-else v-model:open="open" :content="{ align: 'start', side: 'bottom', sideOffset: -32 }">
    <button
      type="button"
      class="focus-ring flex min-h-8 w-full min-w-0 items-center rounded-sm px-2 text-start hover:bg-hover"
      :aria-labelledby="labelId"
    >
      <PropertyValue :field="field" :value="value" :schema="schema" show-empty />
    </button>

    <template #content>
      <form class="flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-1.5 p-1.5" novalidate @submit.prevent="onSubmit" @keydown.esc.stop.prevent="cancel">
        <PropertyField
          :field="field"
          :value="draft"
          :options="options"
          :placeholder="field.placeholder"
          :invalid="Boolean(error)"
          @update:value="(next: TPropertyValue) => (draft = next)"
        />
        <p v-if="error" class="px-1 text-xs text-error" role="alert">
          {{ error }}
        </p>
        <p class="px-1 text-xs text-muted">
          Enter to save · Esc to cancel
        </p>
        <button type="submit" class="sr-only">
          Save
        </button>
      </form>
    </template>
  </UPopover>
</template>
