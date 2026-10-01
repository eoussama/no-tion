<script setup lang="ts">
import type { TAnyDatabaseDefinition, TDatabaseSchema, TLookupResult, TRow, TRowValues } from "~~/core";
import type { TDatabaseFormState } from "~/components/database/DatabaseForm.vue";

import { formatLookupMeta, getRowTitle } from "~~/core";
import DatabaseForm from "~/components/database/DatabaseForm.vue";
import { DATABASE_FORMS } from "~/databases";
import { useCreateRow } from "~/queries";



type TMode = "auto" | "manual";

const props = withDefaults(defineProps<{
  definition: TAnyDatabaseDefinition;
  schema?: TDatabaseSchema | null;
  rows?: ReadonlyArray<TRow>;
  /** Mode used when the panel opens (ignored without a lookup). */
  mode?: TMode;
}>(), {
  schema: null,
  rows: () => [],
  mode: "auto",
});

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();
const uid = useId();
const formId = `${uid}-form`;

const lookup = computed(() => props.definition.lookup);
const formComponent = computed(() => DATABASE_FORMS[props.definition.slug] ?? DatabaseForm);

const mode = ref<TMode>(lookup.value ? props.mode : "manual");
const selected = ref<TLookupResult | null>(null);
const formKey = ref(0);
const state = ref<TDatabaseFormState>({ title: "", canSubmit: true, isSubmitting: false, duplicate: undefined });

const modeItems = computed(() => [
  { label: `Auto · ${lookup.value?.label ?? "Lookup"}`, value: "auto" as const, icon: "i-lucide-sparkles" },
  { label: "Manual", value: "manual" as const, icon: "i-lucide-pencil" },
]);

const modeHint = computed(() => mode.value === "auto"
  ? `Search ${lookup.value?.label ?? "the lookup"}, pick a title, then review the details before adding.`
  : "Fill in the details yourself. Same fields, nothing locked.");

const initialValues = computed<Partial<TRowValues>>(() => {
  if (mode.value === "auto" && selected.value && lookup.value) {
    return lookup.value.toInput(selected.value, { schema: props.schema ?? { dataSourceId: "", titleProperty: "", properties: {} } });
  }

  return {};
});

const locked = computed(() => mode.value === "auto" && selected.value ? lookup.value?.locked ?? [] : []);
const showForm = computed(() => mode.value === "manual" || Boolean(selected.value));

function reset(): void {
  selected.value = null;
  state.value = { title: "", canSubmit: true, isSubmitting: false, duplicate: undefined };
  formKey.value++;
}

watch(mode, reset);

watch(open, (isOpen) => {
  if (isOpen) {
    mode.value = lookup.value ? props.mode : "manual";
  }
  else {
    reset();
  }
});

function onSelect(result: TLookupResult): void {
  selected.value = result;
  formKey.value++;
}

const create = useCreateRow(() => props.definition.slug, () => props.definition);

function onSubmit(values: TRowValues): void {
  const name = String(values[props.definition.titleField] ?? "").trim() || "Entry";

  // Optimistic: the row shows up right away; a failure rolls it back and the API plugin reports the error.
  create.mutate(values);

  toast.add({ title: `${name} added`, description: "Saving to Notion...", color: "success", icon: "i-lucide-check", duration: 2500 });
  open.value = false;
}
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="`New ${definition.title} entry`"
    :description="lookup ? `Search ${lookup.label} to fill the form, or enter it manually.` : 'Fill in the properties of the new entry.'"
    :ui="{ content: 'max-w-full sm:max-w-[560px]' }"
  >
    <template #content="{ close }">
      <div class="flex h-11 shrink-0 items-center gap-2 px-3">
        <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-chevrons-right" aria-label="Close panel" class="text-muted" @click="close" />
        <span class="flex min-w-0 items-center gap-1.5 text-[13px] text-muted">
          <DbIcon :emoji="definition.icon" :size="14" />
          <span class="truncate">{{ definition.title }}</span>
          <span aria-hidden="true">/</span>
          <span class="shrink-0">New entry</span>
        </span>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-5 pt-5 pb-6 sm:px-10">
        <p class="mb-4.5 text-[30px] leading-tight font-bold break-words" :class="state.title ? 'text-default' : 'text-faint'" aria-hidden="true">
          {{ state.title || "Untitled" }}
        </p>

        <div
          v-if="!definition.registered"
          class="mb-4.5 flex items-start gap-2.5 rounded-md bg-accent-soft px-3 py-2.5 text-[13px]"
        >
          <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0 text-link" />
          <span>These fields come straight from the database's properties in Notion. No setup needed.</span>
        </div>

        <template v-if="lookup">
          <TabSwitch v-model="mode" :items="modeItems" label="How to add" variant="segmented" />
          <p class="mt-2 text-[13px] text-muted">
            {{ modeHint }}
          </p>
        </template>

        <div v-if="mode === 'auto' && lookup && !selected" class="mt-5">
          <LookupSearch :definition="definition" :schema="schema" :rows="rows" @select="onSelect" @manual="mode = 'manual'" />
        </div>

        <div v-if="mode === 'auto' && selected" class="mt-5 flex gap-4 rounded-lg bg-card p-3 shadow-card">
          <Poster :src="selected.image" :title="selected.title" :seed="selected.id" :monogram-size="18" loading="eager" class="h-27 w-18 shrink-0 rounded-sm" />
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="text-xs text-muted">Picked from {{ lookup?.label }}</span>
            <span class="truncate text-base font-semibold">
              {{ selected.title }}<span v-if="selected.year" class="font-normal text-muted"> ({{ selected.year }})</span>
            </span>
            <span class="truncate text-[13px] text-muted">{{ formatLookupMeta(selected) }}</span>
            <div class="mt-auto flex flex-wrap gap-1.5 pt-2">
              <UButton color="neutral" variant="outline" size="sm" label="Change" @click="reset" />
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                trailing-icon="i-lucide-external-link"
                :label="`View on ${lookup?.label}`"
                :to="selected.url"
                target="_blank"
              />
            </div>
          </div>
        </div>

        <component
          :is="formComponent"
          v-if="showForm"
          :key="`${mode}-${formKey}`"
          class="mt-5"
          :form-id="formId"
          hide-actions
          :definition="definition"
          :schema="schema"
          :rows="rows"
          :initial-values="initialValues"
          :locked="locked"
          :locked-source="lookup?.label"
          @state="(next: TDatabaseFormState) => (state = next)"
          @submit="onSubmit"
        />
      </div>

      <div class="flex shrink-0 flex-wrap items-center gap-2 border-t border-default py-3 ps-5 pe-4 sm:ps-10">
        <NuxtLink
          v-if="showForm && state.duplicate"
          role="status"
          :to="`/d/${definition.slug}/${state.duplicate.id}`"
          class="focus-ring inline-flex h-7 min-w-0 items-center gap-1.5 rounded-md bg-warn-bg px-2.5 text-[13px] font-medium text-warn-text"
          :title="`Already in ${definition.title}: ${getRowTitle(definition, state.duplicate)}`"
          @click="close"
        >
          <UIcon name="i-lucide-circle-alert" class="size-3.5 shrink-0" />
          <span class="truncate">Already in {{ definition.title }}</span>
        </NuxtLink>
        <span class="flex-1" />
        <UButton color="neutral" variant="outline" label="Cancel" @click="close" />
        <UButton
          type="submit"
          :form="formId"
          label="Add entry"
          :disabled="!showForm || !state.canSubmit"
          :loading="state.isSubmitting"
        />
      </div>
    </template>
  </USlideover>
</template>
