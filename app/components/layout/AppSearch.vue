<script lang="ts" setup>
import type { CommandPaletteGroup, CommandPaletteItem } from "@nuxt/ui";

import { getRowTitle, isOptimisticRow } from "~~/core";
import { useCachedRows, useDatabasesQuery } from "~/queries";



/**
 * @description
 * Ctrl/Cmd K palette over the databases and every cached row (no network: rows come from the local cache).
 */
const open = defineModel<boolean>("open", { default: false });

const { data: databases } = useDatabasesQuery();
const cached = useCachedRows();

const groups = computed<Array<CommandPaletteGroup<CommandPaletteItem>>>(() => [
  {
    id: "databases",
    label: "Databases",
    items: (databases.value ?? []).map(db => ({
      label: db.title,
      icon: emojiOf(db.icon) ? undefined : DATABASE_ICON,
      prefix: emojiOf(db.icon),
      to: `/d/${db.slug}`,
    })),
  },
  {
    id: "rows",
    label: "Entries",
    items: cached.value.filter(entry => !isOptimisticRow(entry.row)).map(({ slug, row, definition, databaseTitle }) => ({
      label: definition ? getRowTitle(definition, row) || "Untitled" : "Untitled",
      suffix: databaseTitle,
      icon: row.cover ? undefined : "i-lucide-file-text",
      avatar: row.cover ? { src: row.cover, alt: "", loading: "lazy" as const } : undefined,
      to: `/d/${slug}/${row.id}`,
    })),
  },
]);
</script>

<template>
  <UDashboardSearch
    v-model:open="open"
    :groups="groups"
    placeholder="Search databases and entries..."
    :fuse="{ resultLimit: 30 }"
  />
</template>
