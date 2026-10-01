<script lang="ts" setup>
import type { BreadcrumbItem } from "@nuxt/ui";
import type { TPageIcon } from "~~/core";

import { getRowTitle } from "~~/core";
import { useDatabaseDefinition, useRowQuery } from "~/queries";



type TCrumb = BreadcrumbItem & { pageIcon?: TPageIcon; emoji?: string };

/**
 * @description
 * Breadcrumb derived from the route; labels come from the query cache (database title, row title).
 */
const route = useRoute();

const slug = computed(() => "slug" in route.params ? String(route.params.slug) : undefined);
const pageId = computed(() => "pageId" in route.params ? String(route.params.pageId) : undefined);

const { definition, meta } = useDatabaseDefinition(slug);
const { data: row } = useRowQuery(slug, pageId);

const items = computed<Array<TCrumb>>(() => {
  if (!slug.value) {
    return [{ label: "Home", icon: "i-lucide-house", to: "/" }];
  }

  const crumbs: Array<TCrumb> = [{
    label: meta.value?.title ?? definition.value?.title ?? "...",
    to: `/d/${slug.value}`,
    pageIcon: meta.value?.icon ?? null,
    emoji: definition.value?.icon,
  }];

  if (pageId.value) {
    crumbs.push({ label: definition.value && row.value ? getRowTitle(definition.value, row.value) || "Untitled" : "...", to: route.path });
  }

  return crumbs;
});
</script>

<template>
  <UBreadcrumb :items="items" color="neutral" class="min-w-0">
    <template #separator>
      <span class="px-0.5 text-[15px] leading-none text-faint select-none">/</span>
    </template>

    <template #item-leading="{ item, index }">
      <DbIcon v-if="slug && index === 0" :icon="(item as TCrumb).pageIcon" :emoji="(item as TCrumb).emoji" :size="16" />
      <UIcon v-else-if="item.icon" :name="item.icon" class="size-4 shrink-0" />
    </template>
  </UBreadcrumb>
</template>
