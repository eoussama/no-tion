<script setup lang="ts">
import type { TAnyDatabaseDefinition, TDatabaseSchema, TFieldDef, TRow, TRowValues } from "~~/core";

import { useForm } from "@tanstack/vue-form";
import { cleanInput, emptyInput, getFormFields, getRowTitle, resolveOptions, validateOptions } from "~~/core";



/**
 * @description
 * State a form reports to its container (the slide-over renders the heading and the footer from it).
 */
export type TDatabaseFormState = {
  title: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  duplicate: TRow | undefined;
};

/**
 * @description
 * The generic create/edit form of a database, driven by its definition: a Notion-like property list.
 * Custom forms registered in `app/databases` receive the same props and emit the same events.
 */
const props = withDefaults(defineProps<{
  definition: TAnyDatabaseDefinition;
  schema?: TDatabaseSchema | null;
  /** Prefilled values (lookup result or existing row); missing keys fall back to the definition defaults. */
  initialValues?: Partial<TRowValues>;
  /** Field keys shown read-only (e.g. prefilled from a lookup). */
  locked?: ReadonlyArray<string>;
  /** Where locked values come from (e.g. `IMDb`). */
  lockedSource?: string;
  /** Existing rows, for the duplicate warning. */
  rows?: ReadonlyArray<TRow>;
  /** Row being edited, excluded from the duplicate check. */
  rowId?: string;
  /** DOM id of the `<form>`, so an external submit button can target it (`form="..."`). */
  formId?: string;
  /** Hide the built-in actions (the container renders its own footer). */
  hideActions?: boolean;
  submitLabel?: string;
  submitIcon?: string;
  pending?: boolean;
  cancelable?: boolean;
}>(), {
  schema: null,
  initialValues: () => ({}),
  locked: () => [],
  lockedSource: undefined,
  rows: () => [],
  rowId: undefined,
  formId: undefined,
  submitLabel: "Save",
  submitIcon: "i-lucide-check",
});

const emit = defineEmits<{
  submit: [values: TRowValues];
  cancel: [];
  state: [state: TDatabaseFormState];
}>();

const uid = useId();
/**
 * @description
 * Notion-like order: the title first; with a lookup, the fields it fills (and locks) next, then the cover;
 * otherwise the cover goes last.
 */
const fields = computed(() => {
  const all = getFormFields(props.definition);
  const title = all.filter(field => field.key === props.definition.titleField);
  const covers = all.filter(field => field.kind === "cover");
  const lockable = new Set<string>(props.definition.lookup?.locked ?? []);
  const lookupFields = all.filter(field => lockable.has(field.key));
  const rest = all.filter(field => field.key !== props.definition.titleField && field.kind !== "cover" && !lockable.has(field.key));

  return props.definition.lookup ? [...title, ...lookupFields, ...covers, ...rest] : [...title, ...rest, ...covers];
});
const lockedKeys = computed(() => new Set(props.locked));

function validate(value: TRowValues): { fields: Record<string, string> } | undefined {
  const input = cleanInput(props.definition, value);
  const errors: Record<string, string> = props.schema ? validateOptions(props.definition, input, props.schema) : {};
  const result = props.definition.inputSchema.safeParse(input);

  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "");

      if (key && !errors[key]) {
        errors[key] = issue.message;
      }
    }
  }

  return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
}

const form = useForm({
  defaultValues: { ...emptyInput(props.definition), ...props.initialValues } as TRowValues,
  validators: {
    onChange: ({ value }) => validate(value),
    onSubmit: ({ value }) => validate(value),
  },
  onSubmit: ({ value }) => {
    emit("submit", cleanInput(props.definition, value));
  },
});

const values = form.useStore(state => state.values);
const canSubmit = form.useStore(state => state.canSubmit);
const isSubmitting = form.useStore(state => state.isSubmitting);
const submissionAttempts = form.useStore(state => state.submissionAttempts);

function isVisible(field: TFieldDef): boolean {
  // A cover picked from a lookup is previewed by the container (summary card), not edited.
  if (field.kind === "cover" && props.locked.length > 0) {
    return false;
  }

  return !field.visibleWhen || field.visibleWhen(values.value);
}

const duplicate = computed(() => {
  const duplicateOf = props.definition.lookup?.duplicateOf;

  return duplicateOf ? duplicateOf(values.value, props.rows.filter(row => row.id !== props.rowId)) : undefined;
});

const title = computed(() => {
  const value = values.value[props.definition.titleField];

  return typeof value === "string" ? value.trim() : "";
});

watchEffect(() => {
  emit("state", { title: title.value, canSubmit: canSubmit.value, isSubmitting: isSubmitting.value, duplicate: duplicate.value });
});

function groupsOf(field: TFieldDef) {
  return field.property ? props.schema?.properties[field.property]?.groups ?? [] : [];
}

function toMessage(error: unknown): string | undefined {
  if (typeof error === "string") {
    return error;
  }

  return error && typeof error === "object" && "message" in error && typeof error.message === "string" ? error.message : undefined;
}

function lockedText(field: TFieldDef): string {
  const value = values.value[field.key];

  return Array.isArray(value) ? value.join(", ") : value === null || value === undefined ? "" : String(value);
}

/**
 * URL-like locked fields get a trailing "open link" button.
 *
 * @param field - The field definition.
 * @returns Whether the locked value is a link to show a button for.
 */
function hasLockedLink(field: TFieldDef): boolean {
  return (field.kind === "url" || field.kind === "cover") && /^https?:\/\//.test(lockedText(field));
}

defineExpose({ submit: () => form.handleSubmit() });
</script>

<template>
  <form :id="formId" class="flex flex-col gap-0.5" novalidate @submit.prevent.stop="form.handleSubmit">
    <template v-for="field in fields" :key="field.key">
      <form.Field v-if="isVisible(field)" :name="field.key">
        <template #default="{ field: api }">
          <div class="grid grid-cols-1 items-start gap-x-2 gap-y-1 py-[3px] sm:grid-cols-[150px_minmax(0,1fr)]">
            <label
              :id="`${uid}-${field.key}-label`"
              :for="lockedKeys.has(field.key) ? undefined : `${uid}-${field.key}`"
              class="flex min-h-8 items-center gap-2 text-muted"
            >
              <UIcon :name="propertyIcon(field.kind)" class="size-[15px] shrink-0" />
              <span class="truncate">{{ field.label }}</span>
              <span v-if="field.required" class="text-error" aria-hidden="true">*</span>
              <span v-if="field.required" class="sr-only">(required)</span>
            </label>

            <div class="min-w-0">
              <div
                v-if="lockedKeys.has(field.key)"
                :aria-labelledby="`${uid}-${field.key}-label`"
                class="flex h-8 min-w-0 items-center gap-2 rounded-md bg-hover ps-2.5"
                :class="hasLockedLink(field) ? 'pe-1' : 'pe-2.5'"
              >
                <span class="flex min-w-0 flex-1 items-center">
                  <PropertyValue
                    v-if="field.kind === 'select' || field.kind === 'status' || field.kind === 'multi_select'"
                    :field="field"
                    :value="api.state.value as never"
                    :schema="schema"
                  />
                  <span v-else class="truncate text-muted">{{ lockedText(field) }}</span>
                </span>
                <span class="inline-flex shrink-0 items-center gap-1 text-xs text-muted">
                  <UIcon name="i-lucide-lock" class="size-3" />
                  <span>{{ lockedSource ? `From ${lockedSource}` : "Locked" }}</span>
                </span>
                <UButton
                  v-if="hasLockedLink(field)"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-external-link"
                  :to="lockedText(field)"
                  target="_blank"
                  :aria-label="`Open ${field.label} link in a new tab`"
                  class="text-muted"
                />
              </div>

              <PropertyField
                v-else
                :id="`${uid}-${field.key}`"
                :field="field"
                :value="api.state.value as never"
                :options="resolveOptions(field, schema)"
                :groups="groupsOf(field)"
                :placeholder="field.placeholder"
                :invalid="Boolean((api.state.meta.isTouched || submissionAttempts > 0) && api.state.meta.errors.length)"
                @update:value="api.handleChange"
                @blur="api.handleBlur"
              />

              <p
                v-if="(api.state.meta.isTouched || submissionAttempts > 0) && toMessage(api.state.meta.errors[0])"
                class="mt-1 text-xs text-error"
                role="alert"
              >
                {{ toMessage(api.state.meta.errors[0]) }}
              </p>
              <p v-else-if="field.description" class="mt-1 text-xs text-muted">
                {{ field.description }}
              </p>
            </div>
          </div>
        </template>
      </form.Field>
    </template>

    <div v-if="!hideActions" class="mt-4 flex items-center justify-end gap-2">
      <span v-if="duplicate" role="status" class="me-auto inline-flex h-7 items-center gap-1.5 rounded-md bg-warn-bg px-2.5 text-[13px] font-medium text-warn-text">
        <UIcon name="i-lucide-circle-alert" class="size-3.5" />
        Already in {{ definition.title }}: {{ getRowTitle(definition, duplicate) }}
      </span>
      <UButton v-if="cancelable" color="neutral" variant="outline" label="Cancel" @click="emit('cancel')" />
      <UButton type="submit" :icon="submitIcon" :label="submitLabel" :disabled="!canSubmit" :loading="isSubmitting || pending" />
    </div>
  </form>
</template>
