<script setup lang="ts">
interface TProps {
  count?: number;
}

withDefaults(defineProps<TProps>(), {
  count: 3,
});
</script>

<template>
  <div class="database-list">
    <div
      v-for="i in count"
      :key="i"
      class="database-item skeleton-item"
    >
      &nbsp;
    </div>
  </div>
</template>

<style scoped>
.skeleton-item {
  pointer-events: none;
  cursor: default !important;
  background: rgba(55, 53, 47, 0.08);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  position: relative;
  overflow: hidden;
  /* Ensure exact same dimensions as real items */
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 3px;
  min-height: 56px;
}

@media (prefers-color-scheme: dark) {
  .skeleton-item {
    background: rgba(255, 255, 255, 0.08);
  }
}

.skeleton-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(55, 53, 47, 0.12) 50%,
    transparent 100%
  );
  animation: skeleton-shimmer 2s infinite;
}

@media (prefers-color-scheme: dark) {
  .skeleton-item::before {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.12) 50%,
      transparent 100%
    );
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>
