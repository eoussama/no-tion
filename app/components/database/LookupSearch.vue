<script setup lang="ts">
import type { TAnyDatabaseDefinition, TDatabaseSchema, TLookupResult, TRow } from "~~/core";

import { formatLookupMeta } from "~~/core";
import { LOOKUP_MIN_LENGTH, useLookupQuery } from "~/queries";



/** `TLookupResult` is nested: its `type` key would clash with the menu item `type`. */
type TLookupItem = { id: string; label: string; title: string; year: number | null; meta: string; image: string | null; duplicate: boolean; result: TLookupResult };

const props = defineProps<{
  definition: TAnyDatabaseDefinition;
  schema?: TDatabaseSchema | null;
  rows?: ReadonlyArray<TRow>;
}>();

const emit = defineEmits<{
  select: [result: TLookupResult];
  manual: [];
}>();

const uid = useId();
const lookup = computed(() => props.definition.lookup);
const label = computed(() => lookup.value?.label ?? "Lookup");
const term = ref("");
const selected = ref<TLookupItem | undefined>(undefined);

const { data, isFetching, isDebouncing, isError, isSuccess } = useLookupQuery(() => lookup.value?.provider, term);

function isDuplicate(result: TLookupResult): boolean {
  const def = lookup.value;

  if (!def?.duplicateOf || !props.schema) {
    return false;
  }

  return Boolean(def.duplicateOf(def.toInput(result, { schema: props.schema }), props.rows ?? []));
}

const trimmed = computed(() => term.value.trim());
const tooShort = computed(() => trimmed.value.length > 0 && trimmed.value.length < LOOKUP_MIN_LENGTH);

const items = computed<Array<TLookupItem>>(() => (trimmed.value.length >= LOOKUP_MIN_LENGTH ? data.value ?? [] : []).map(result => ({
  id: result.id,
  label: result.year ? `${result.title} (${result.year})` : result.title,
  title: result.title,
  year: result.year,
  meta: formatLookupMeta(result),
  image: result.image,
  duplicate: isDuplicate(result),
  result,
})));

const loading = computed(() => trimmed.value.length >= LOOKUP_MIN_LENGTH && (isFetching.value || isDebouncing.value));
const settled = computed(() => trimmed.value.length >= LOOKUP_MIN_LENGTH && !loading.value);
const unavailable = computed(() => settled.value && isError.value);
const noMatches = computed(() => settled.value && isSuccess.value && items.value.length === 0);

/** The dropdown only opens when it has something to show; errors and "no matches" are explained below the field. */
const wantsOpen = ref(false);
const menuOpen = computed({
  get: () => wantsOpen.value && (items.value.length > 0 || loading.value),
  set: (value: boolean) => {
    wantsOpen.value = value;
  },
});

function onSelect(item: TLookupItem | null | undefined): void {
  if (!item) {
    return;
  }

  emit("select", item.result);

  selected.value = undefined;
  term.value = "";
}
</script>

<template>
  <div>
    <label :for="`${uid}-search`" class="mb-1.5 block text-xs font-medium text-muted">Search {{ label }}</label>

    <UInputMenu
      :id="`${uid}-search`"
      v-model:search-term="term"
      v-model:open="menuOpen"
      class="w-full"
      size="lg"
      icon="i-lucide-search"
      ignore-filter
      autofocus
      :trailing-icon="false"
      :items="items"
      :model-value="selected"
      :loading="loading"
      :placeholder="lookup?.placeholder ?? 'Title, e.g. The Dark Knight'"
      :content="{ align: 'start', sideOffset: 6 }"
      :ui="{ content: 'max-h-[26rem]', item: 'py-1.5 px-3 before:inset-x-0 before:rounded-none', group: 'px-0 py-0', viewport: 'py-0' }"
      @update:model-value="onSelect"
    >
      <template #content-top>
        <div v-if="items.length" class="px-3 pt-2 pb-1.5 text-xs text-muted">
          {{ items.length }} {{ items.length === 1 ? "result" : "results" }} from {{ label }}
        </div>
      </template>

      <template #item="{ item }">
        <div class="flex w-full min-w-0 items-center gap-3">
          <Poster :src="item.image" :title="item.title" :seed="item.id" :monogram-size="9" class="h-12 w-8 shrink-0 rounded-[3px]" />

          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate font-medium text-default">
              {{ item.title }}<span v-if="item.year" class="font-normal text-muted"> ({{ item.year }})</span>
            </span>
            <span class="truncate text-xs text-muted">{{ item.meta }}</span>
          </div>

          <span v-if="item.duplicate" class="inline-flex h-5 shrink-0 items-center gap-1 rounded-[3px] bg-tag-green px-1.5 text-xs text-tag-text">
            <UIcon name="i-lucide-check" class="size-3" />
            Added
          </span>
        </div>
      </template>

      <template #content-bottom>
        <div v-if="items.length" class="mt-1.5 border-t border-default px-3 pt-1.5 pb-2 text-xs text-muted">
          Up and down to move · Enter to pick · Esc to close
        </div>
      </template>

      <template #empty>
        <span class="text-[13px] text-muted">
          <template v-if="trimmed.length < LOOKUP_MIN_LENGTH">Type at least {{ LOOKUP_MIN_LENGTH }} characters to search.</template>
          <template v-else-if="loading">Searching {{ label }}...</template>
          <template v-else-if="unavailable">{{ label }} search is unavailable right now.</template>
          <template v-else>No matches on {{ label }}.</template>
        </span>
      </template>
    </UInputMenu>

    <p v-if="tooShort" class="mt-2.5 text-[13px] text-muted">
      Type at least {{ LOOKUP_MIN_LENGTH }} characters to search.
    </p>

    <div
      v-else-if="unavailable"
      role="status"
      class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md bg-accent-soft px-3 py-2.5 text-[13px]"
    >
      <UIcon name="i-lucide-cloud-off" class="size-4 shrink-0 text-link" />
      <span class="min-w-0 flex-1">{{ label }} search isn't reachable right now. You can still add this entry by hand.</span>
      <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-pencil" label="Enter it manually" @click="emit('manual')" />
    </div>

    <div v-else-if="noMatches" class="mt-2.5 flex flex-wrap items-center gap-2.5 text-[13px] text-muted">
      <span>No matches on {{ label }}.</span>
      <UButton color="neutral" variant="outline" size="sm" label="Enter it manually" @click="emit('manual')" />
    </div>
  </div>
</template>
