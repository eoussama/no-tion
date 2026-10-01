<script lang="ts" setup>
/**
 * @description
 * Light / dark segmented switch (persisted by @nuxtjs/color-mode under `nuxt-color-mode`).
 */
const colorMode = useColorMode();

const modes = [
  { value: "light", label: "Light mode", icon: "i-lucide-sun" },
  { value: "dark", label: "Dark mode", icon: "i-lucide-moon" },
] as const;

function select(value: "light" | "dark"): void {
  colorMode.preference = value;
}
</script>

<template>
  <div role="group" aria-label="Color mode" class="flex gap-0.5 rounded-md bg-active p-0.5">
    <button
      v-for="mode in modes"
      :key="mode.value"
      type="button"
      :aria-label="mode.label"
      :aria-pressed="colorMode.value === mode.value"
      class="focus-ring flex h-6 w-7 items-center justify-center rounded-sm transition-colors"
      :class="colorMode.value === mode.value ? 'bg-default text-default shadow-[0_1px_2px_rgba(15,15,15,0.12)] dark:bg-pop dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]' : 'text-muted hover:text-default'"
      @click="select(mode.value)"
    >
      <UIcon :name="mode.icon" class="size-3.5" />
    </button>
  </div>
</template>
