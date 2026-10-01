<script setup lang="ts">
import type { InputProps } from "@nuxt/ui";



/**
 * @description
 * The part of a TanStack `FieldApi` this component relies on.
 */
export type TAppFieldApi = {
  name: string;
  state: {
    value: unknown;
    meta: {
      errors: Array<unknown>;
      isTouched: boolean;
    };
  };
  handleChange: (value: string) => void;
  handleBlur: () => void;
};

const props = withDefaults(defineProps<{
  field: TAppFieldApi;
  label?: string;
  description?: string;
  hint?: string;
  required?: boolean;
  type?: InputProps["type"];
  placeholder?: string;
  size?: InputProps["size"];
  icon?: string;
  readonly?: boolean;
  autocomplete?: string;
  autofocus?: boolean;
}>(), {
  type: "text",
  size: "md",
});

defineSlots<{
  default?: (props: { value: unknown; invalid: boolean; blur: () => void }) => unknown;
  trailing?: () => unknown;
}>();

function toMessage(error: unknown): string | undefined {
  if (!error) {
    return undefined;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return undefined;
}

const error = computed(() => props.field.state.meta.isTouched ? toMessage(props.field.state.meta.errors[0]) : undefined);
</script>

<template>
  <UFormField
    :name="field.name"
    :label="label"
    :description="description"
    :hint="hint"
    :required="required"
    :error="error"
    class="w-full"
  >
    <slot :value="field.state.value" :invalid="Boolean(error)" :blur="field.handleBlur">
      <UInput
        class="w-full"
        :type="type"
        :size="size"
        :icon="icon"
        :name="field.name"
        :readonly="readonly"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :ui="$slots.trailing ? { trailing: 'pe-1' } : undefined"
        :model-value="String(field.state.value ?? '')"
        @blur="field.handleBlur"
        @update:model-value="(value: string | number) => field.handleChange(String(value))"
      >
        <template v-if="$slots.trailing" #trailing>
          <slot name="trailing" />
        </template>
      </UInput>
    </slot>
  </UFormField>
</template>
