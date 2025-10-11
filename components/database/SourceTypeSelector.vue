<script setup lang="ts">
import { MediaSourceType } from "~/core";



const sourceType = defineModel<MediaSourceType>({
  required: true,
});
</script>

<template>
  <div class="form-section">
    <label class="form-label">Source Type</label>
    <div class="radio-group">
      <label
        class="radio-option"
        :class="{ 'radio-option-active': sourceType === MediaSourceType.IMDB }"
      >
        <input
          v-model="sourceType"
          type="radio"
          name="sourceType"
          :value="MediaSourceType.IMDB"
          class="radio-input"
        >
        <span class="radio-label">IMDB</span>
      </label>
      <label
        class="radio-option"
        :class="{ 'radio-option-active': sourceType === MediaSourceType.OTHER }"
      >
        <input
          v-model="sourceType"
          type="radio"
          name="sourceType"
          :value="MediaSourceType.OTHER"
          class="radio-input"
        >
        <span class="radio-label">Other</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(55, 53, 47, 0.65);
  margin-bottom: 4px;
}

@media (prefers-color-scheme: dark) {
  .form-label {
    color: rgba(255, 255, 255, 0.45);
  }
}

.radio-group {
  display: flex;
  flex-direction: row;
  gap: 0;
  background: rgba(55, 53, 47, 0.08);
  border-radius: 3px;
  padding: 2px;
}

@media (prefers-color-scheme: dark) {
  .radio-group {
    background: rgba(255, 255, 255, 0.08);
  }
}

.radio-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 20ms ease-in;
  border: none;
  background: transparent;
}

.radio-option:hover:not(.radio-option-active) {
  background: rgba(55, 53, 47, 0.06);
}

.radio-option-active {
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  .radio-option:hover:not(.radio-option-active) {
    background: rgba(255, 255, 255, 0.06);
  }

  .radio-option-active {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
}

.radio-input {
  display: none;
}

.radio-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(55, 53, 47, 0.65);
  cursor: pointer;
  user-select: none;
  transition: color 20ms ease-in;
}

.radio-option-active .radio-label {
  color: var(--color-text);
}

@media (prefers-color-scheme: dark) {
  .radio-label {
    color: rgba(255, 255, 255, 0.5);
  }

  .radio-option-active .radio-label {
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
