<script setup lang="ts">
/**
 * @description
 * A poster/cover image, with a tone block + monogram as the empty-state fallback (or when the image fails to load).
 */
const props = withDefaults(defineProps<{
  src?: string | null;
  title: string;
  /** Seed for the fallback tone (e.g. the row id). */
  seed?: string;
  /** Monogram font size in pixels (0 hides it). */
  monogramSize?: number;
  loading?: "lazy" | "eager";
}>(), {
  src: null,
  seed: undefined,
  monogramSize: 0,
  loading: "lazy",
});

const failed = ref(false);

watch(() => props.src, () => {
  failed.value = false;
});

const tone = computed(() => TONE_BACKGROUNDS[toneOf(props.seed ?? props.title)]);
const showImage = computed(() => Boolean(props.src) && !failed.value);
</script>

<template>
  <span class="relative block overflow-hidden" :class="showImage ? 'bg-elevated' : tone">
    <img
      v-if="showImage"
      :src="src!"
      alt=""
      :loading="loading"
      decoding="async"
      class="size-full object-cover"
      @error="failed = true"
    >
    <span
      v-else-if="monogramSize > 0"
      class="absolute bottom-0 left-0 p-[8%] font-bold leading-none text-tag-text opacity-45"
      :style="{ fontSize: `${monogramSize}px` }"
      aria-hidden="true"
    >{{ monogram(title) }}</span>
  </span>
</template>
