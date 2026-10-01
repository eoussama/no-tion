<script setup lang="ts" generic="T extends string">
/**
 * @description
 * Notion-style tab switch (ARIA tablist, roving arrow-key focus):
 * `underline` for view tabs (Gallery / Table), `segmented` for the pill switch (Auto / Manual).
 */
const props = withDefaults(defineProps<{
  items: ReadonlyArray<{ value: T; label: string; icon?: string }>;
  label: string;
  variant?: "underline" | "segmented";
}>(), {
  variant: "underline",
});

const model = defineModel<T>({ required: true });

const buttons = ref<Array<HTMLButtonElement>>([]);

function onKeydown(event: KeyboardEvent, index: number): void {
  const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;

  if (!step) {
    return;
  }

  event.preventDefault();

  const next = (index + step + props.items.length) % props.items.length;
  const item = props.items[next];

  if (item) {
    model.value = item.value;
    buttons.value[next]?.focus();
  }
}
</script>

<template>
  <div
    role="tablist"
    :aria-label="label"
    :class="variant === 'segmented' ? 'inline-flex gap-0.5 rounded-[7px] bg-active p-0.5' : 'flex items-end gap-4 self-stretch'"
  >
    <button
      v-for="(item, index) in items"
      :key="item.value"
      ref="buttons"
      type="button"
      role="tab"
      :aria-selected="model === item.value"
      :tabindex="model === item.value ? 0 : -1"
      class="focus-ring inline-flex items-center gap-1.5 font-medium whitespace-nowrap transition-colors"
      :class="variant === 'segmented'
        ? ['h-7 rounded-[5px] px-3 text-[13px]', model === item.value ? 'bg-default text-default shadow-[0_1px_2px_rgba(15,15,15,0.12)] dark:bg-pop dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]' : 'text-muted hover:text-default']
        : ['-mb-px h-[39px] rounded-t-sm border-b-2 px-0.5', model === item.value ? 'border-current text-default' : 'border-transparent text-muted hover:text-default']"
      @click="model = item.value"
      @keydown="onKeydown($event, index)"
    >
      <UIcon v-if="item.icon" :name="item.icon" class="size-[15px] shrink-0" />
      {{ item.label }}
    </button>
  </div>
</template>
