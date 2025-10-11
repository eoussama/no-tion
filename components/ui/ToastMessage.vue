<script setup lang="ts">
import type { TToastMessage } from "~/core";
import { AlertCircle, CheckCircle } from "lucide-vue-next";
import { computed } from "vue";



const props = defineProps<{
  toast: TToastMessage | null;
}>();

const iconComponent = computed(() =>
  props.toast?.type === "success" ? CheckCircle : AlertCircle,
);
</script>

<template>
  <transition name="fade">
    <div
      v-if="props.toast"
      class="toast"
      :class="{
        'toast-success': props.toast.type === 'success',
        'toast-error': props.toast.type === 'error',
      }"
    >
      <component :is="iconComponent" :size="18" />
      <span>{{ props.toast.message }}</span>
    </div>
  </transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 400px;
}

.toast-success {
  background: #10b981;
  color: white;
}

.toast-error {
  background: #ef4444;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
