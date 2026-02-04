<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: string;
}>();
</script>

<template>
  <div class="form-field">
    <label class="form-label">{{ props.label }}</label>
    <input
      :value="props.value"
      type="text"
      class="form-input form-input-readonly"
      readonly
    >
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.form-input {
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
  color: var(--color-text);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  transition: all 20ms ease-in;
  outline: none;
  box-shadow: inset 0 0 0 1px rgba(55, 53, 47, 0.16);
}

.form-input:hover {
  box-shadow: inset 0 0 0 1px rgba(55, 53, 47, 0.24);
}

.form-input:focus {
  background: rgba(35, 131, 226, 0.04);
  box-shadow: inset 0 0 0 2px rgba(35, 131, 226, 0.5);
}

@media (prefers-color-scheme: dark) {
  .form-input {
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
  }

  .form-input:hover {
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.24);
  }

  .form-input:focus {
    background: rgba(35, 131, 226, 0.08);
    box-shadow: inset 0 0 0 2px rgba(35, 131, 226, 0.5);
  }
}

.form-input-readonly {
  background: rgba(55, 53, 47, 0.04);
  cursor: default;
  color: rgba(55, 53, 47, 0.75);
}

.form-input-readonly:focus {
  box-shadow: inset 0 0 0 1px rgba(55, 53, 47, 0.16);
  border-color: rgba(55, 53, 47, 0.16);
}

@media (prefers-color-scheme: dark) {
  .form-input-readonly {
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.65);
  }

  .form-input-readonly:focus {
    border-color: rgba(255, 255, 255, 0.094);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.094);
  }
}
</style>
