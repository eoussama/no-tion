<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { TFieldDef, TPropertyValue } from "~~/core";

import { getRowTitle, isOptimisticRow } from "~~/core";
import { useArchiveRow, useDatabaseDefinition, useRowQuery, useUpdateRow } from "~/queries";



const route = useRoute("d-slug-pageId");
const slug = computed(() => route.params.slug);
const pageId = computed(() => route.params.pageId);

const toast = useToast();
const uid = useId();
const { definition, schema } = useDatabaseDefinition(slug);
const { data: row, isPending, isError, error, refetch } = useRowQuery(slug, pageId);

const confirmArchive = ref(false);

const update = useUpdateRow(slug, definition);
const archive = useArchiveRow(slug);

const title = computed(() => definition.value && row.value ? getRowTitle(definition.value, row.value) || "Untitled" : "");
const properties = computed(() => definition.value?.fields.filter(field => field.key !== definition.value?.titleField && field.kind !== "cover") ?? []);

const cover = computed(() => {
  const key = definition.value?.views?.gallery?.cover;
  const value = key && row.value ? row.value.values[key] : null;

  return typeof value === "string" && value ? value : row.value?.cover ?? null;
});

const now = useNow({ interval: 60_000 });
const edited = computed(() => row.value ? `Edited ${formatRelative(row.value.lastEditedTime, now.value.getTime())}` : "");

useHead({ title });

function validator(field: TFieldDef) {
  return (value: TPropertyValue): string | undefined => {
    const schemaOf = definition.value?.inputSchema.shape[field.key] as { safeParse?: (input: unknown) => { success: boolean; error?: { issues: Array<{ message: string }> } } } | undefined;
    const result = schemaOf?.safeParse?.(value);

    return result && !result.success ? result.error?.issues[0]?.message ?? "Invalid value" : undefined;
  };
}

function onSave(field: TFieldDef, value: TPropertyValue): void {
  if (!row.value || isOptimisticRow(row.value)) {
    return;
  }

  update.mutate({ id: row.value.id, input: { [field.key]: value } });
}

async function copyLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast.add({ title: "Link copied", icon: "i-lucide-link", duration: 2000 });
  }
  catch {
    toast.add({ title: "Unable to copy the link", color: "error", icon: "i-lucide-circle-alert" });
  }
}

const moreItems = computed<Array<Array<DropdownMenuItem>>>(() => [
  [
    { label: "Copy link", icon: "i-lucide-link", onSelect: copyLink },
    ...(row.value?.notionUrl ? [{ label: "Open in Notion", icon: "i-lucide-external-link", to: row.value.notionUrl, target: "_blank" }] : []),
  ],
  [{ label: "Archive", icon: "i-lucide-archive", color: "error" as const, onSelect: () => (confirmArchive.value = true) }],
]);

function onArchive(): void {
  if (!row.value) {
    return;
  }

  const id = row.value.id;
  const name = title.value;

  confirmArchive.value = false;
  archive.mutate(id, {
    onSuccess: () => toast.add({ title: "Archived", description: name, icon: "i-lucide-archive" }),
  });

  navigateTo(`/d/${slug.value}`);
}
</script>

<template>
  <div class="pb-16">
    <Teleport defer to="#navbar-actions">
      <span v-if="row && edited" class="hidden text-xs text-muted xl:inline">{{ edited }}</span>
      <UDropdownMenu v-if="row" :items="moreItems" :content="{ align: 'end' }">
        <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-ellipsis" aria-label="More actions" />
      </UDropdownMenu>
    </Teleport>

    <div
      v-if="isError && !row"
      role="alert"
      class="mx-4 mt-10 flex flex-wrap items-center gap-3 rounded-md bg-tag-red px-3 py-2.5 text-[13px] text-tag-text sm:mx-12 lg:mx-24"
    >
      <UIcon name="i-lucide-circle-alert" class="size-4 shrink-0" />
      <span class="flex-1">Unable to load this entry: {{ getErrorMessage(error) }}</span>
      <UButton color="neutral" variant="outline" size="sm" label="Retry" @click="refetch()" />
    </div>

    <div v-else-if="isPending || !row || !definition" aria-busy="true" aria-label="Loading entry">
      <USkeleton class="h-[180px] rounded-none" />
      <div class="mx-auto max-w-[760px] px-4 sm:px-12">
        <USkeleton class="mt-6 h-10 w-2/3" />
        <USkeleton v-for="i in 6" :key="i" class="mt-3 h-6" />
      </div>
    </div>

    <article v-else>
      <div class="relative h-[140px] overflow-hidden sm:h-[180px]" aria-hidden="true">
        <div v-if="cover" class="absolute inset-0 scale-110 opacity-70 blur-2xl">
          <Poster :src="cover" :title="title" :seed="row.id" loading="eager" class="size-full" />
        </div>
        <div v-else class="size-full" :class="TONE_BACKGROUNDS[toneOf(row.id)]" />
      </div>

      <div class="mx-auto max-w-[760px] px-4 sm:px-12">
        <Poster
          v-if="definition.views?.gallery?.cover || cover"
          :src="cover"
          :title="title"
          :seed="row.id"
          :monogram-size="26"
          loading="eager"
          class="relative -mt-[72px] h-36 w-24 rounded-sm shadow-[0_0_0_3px_var(--ui-bg),var(--notion-card)]"
        />
        <DbIcon v-else-if="row.icon" :icon="row.icon" :size="72" class="relative -mt-9" />

        <h1 class="mt-4.5 mb-3.5 text-[30px] leading-tight font-bold tracking-[-0.01em] break-words sm:text-[40px]">
          {{ title }}
        </h1>

        <p v-if="isOptimisticRow(row)" class="mb-3 inline-flex h-6 items-center gap-1.5 rounded-[3px] bg-accent-soft px-2 text-xs text-link">
          <UIcon name="i-lucide-refresh-cw" class="size-3 animate-spin" />
          Saving to Notion...
        </p>

        <dl class="flex flex-col gap-0.5">
          <div
            v-for="field in properties"
            :key="field.key"
            class="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] items-center sm:grid-cols-[160px_minmax(0,1fr)]"
          >
            <dt :id="`${uid}-${field.key}`" class="flex min-h-8.5 min-w-0 items-center gap-2 text-muted">
              <UIcon :name="propertyIcon(field.kind)" class="size-[15px] shrink-0" />
              <span class="truncate">{{ field.label }}</span>
            </dt>
            <dd class="min-w-0">
              <InlineProperty
                :field="field"
                :value="row.values[field.key] ?? null"
                :schema="schema"
                :validate="validator(field)"
                :label-id="`${uid}-${field.key}`"
                @save="(value: TPropertyValue) => onSave(field, value)"
              />
            </dd>
          </div>
        </dl>

        <div class="mt-6 flex flex-wrap items-center gap-2.5 border-t border-default pt-4.5 text-muted">
          <UIcon name="i-lucide-file-text" class="size-4 shrink-0" />
          <span>Page content stays in Notion.</span>
          <a
            v-if="row.notionUrl"
            :href="row.notionUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="focus-ring rounded-sm font-medium text-link hover:underline"
          >Open in Notion</a>
        </div>
      </div>
    </article>

    <UModal v-model:open="confirmArchive" title="Archive this entry?" :description="`${title} will be moved to Notion's trash.`">
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" label="Cancel" @click="confirmArchive = false" />
          <UButton color="error" icon="i-lucide-archive" label="Archive" :loading="archive.isPending.value" @click="onArchive" />
        </div>
      </template>
    </UModal>
  </div>
</template>
