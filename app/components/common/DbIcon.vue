<script setup lang="ts">
import type { TPageIcon } from "~~/core";



/**
 * @description
 * A database or page icon: Notion emoji, image, or a fallback Lucide icon. Decorative (`aria-hidden`).
 */
const props = withDefaults(defineProps<{
  icon?: TPageIcon;
  /** Emoji used when `icon` is empty (e.g. a registered definition's icon). */
  emoji?: string;
  fallback?: string;
  /** Size in pixels. */
  size?: number;
}>(), {
  icon: null,
  emoji: undefined,
  fallback: DATABASE_ICON,
  size: 16,
});

const emojiValue = computed(() => emojiOf(props.icon) ?? props.emoji);
const imageUrl = computed(() => props.icon?.type === "url" ? props.icon.value : undefined);
const box = computed(() => ({ width: `${props.size}px`, height: `${props.size}px` }));
</script>

<template>
  <span class="inline-flex shrink-0 items-center justify-center leading-none" :style="box" aria-hidden="true">
    <img v-if="imageUrl" :src="imageUrl" alt="" class="size-full rounded-[3px] object-cover">
    <span v-else-if="emojiValue" :style="{ fontSize: `${Math.round(size * 0.86)}px` }">{{ emojiValue }}</span>
    <UIcon v-else :name="fallback" class="size-full" />
  </span>
</template>
