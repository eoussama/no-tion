<script setup lang="ts">
import type { TNotionColor } from "~~/core";



const props = withDefaults(defineProps<{
  name: string;
  color?: TNotionColor;
  /** `status` renders Notion's rounded pill with a colored dot. */
  variant?: "tag" | "status";
}>(), {
  color: "default",
  variant: "tag",
});

/**
 * @description
 * Notion option colors → tag palette tokens (`assets/css/main.css`), as literal class strings so Tailwind picks them up.
 */
const BACKGROUNDS: Record<TNotionColor, string> = {
  default: "bg-tag-default",
  gray: "bg-tag-gray",
  brown: "bg-tag-brown",
  orange: "bg-tag-orange",
  yellow: "bg-tag-yellow",
  green: "bg-tag-green",
  blue: "bg-tag-blue",
  purple: "bg-tag-purple",
  pink: "bg-tag-pink",
  red: "bg-tag-red",
};

const DOTS: Record<TNotionColor, string> = {
  default: "bg-dot-default",
  gray: "bg-dot-gray",
  brown: "bg-dot-brown",
  orange: "bg-dot-orange",
  yellow: "bg-dot-yellow",
  green: "bg-dot-green",
  blue: "bg-dot-blue",
  purple: "bg-dot-purple",
  pink: "bg-dot-pink",
  red: "bg-dot-red",
};

const background = computed(() => BACKGROUNDS[props.color] ?? BACKGROUNDS.default);
const dot = computed(() => DOTS[props.color] ?? DOTS.default);
</script>

<template>
  <span
    class="inline-flex h-5 min-w-0 max-w-full shrink-0 items-center text-xs leading-none whitespace-nowrap text-tag-text"
    :class="[background, variant === 'status' ? 'gap-[5px] rounded-[10px] ps-1.5 pe-[7px]' : 'rounded-[3px] px-1.5']"
  >
    <span v-if="variant === 'status'" class="size-[7px] shrink-0 rounded-full" :class="dot" aria-hidden="true" />
    <span class="truncate">{{ name }}</span>
  </span>
</template>
