<script setup lang="ts">
import { ChevronRight, Home } from "lucide-vue-next";
import { DATABASES } from "~/core";



const route = useRoute();
const databaseId = route.params.id as string;

// Find the database name from constants
const databaseName = Object.entries(DATABASES).find(([_, id]) => id === databaseId)?.[0] || "Unknown";

// Form state
const sourceType = ref<"IMDB" | "OTHER">("IMDB");
const imdbUrl = ref("");
const otherUrl = ref("");
</script>

<template>
  <div class="page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <NuxtLink to="/" class="breadcrumb-item">
        <Home :size="14" />
        <span>Home</span>
      </NuxtLink>
      <span class="breadcrumb-separator">
        <ChevronRight :size="14" />
      </span>
      <div class="breadcrumb-item breadcrumb-item-current">
        <span>{{ databaseName }}</span>
      </div>
    </nav>

    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        {{ databaseName.replace(/_/g, " ") }}
      </h1>
    </div>

    <!-- Page Content -->
    <div class="page-body">
      <div class="form-container">
        <div class="form-section">
          <label class="form-label">Source Type</label>
          <div class="radio-group">
            <label
              class="radio-option"
              :class="{ 'radio-option-active': sourceType === 'IMDB' }"
            >
              <input
                v-model="sourceType"
                type="radio"
                name="sourceType"
                value="IMDB"
                class="radio-input"
              >
              <span class="radio-label">IMDB</span>
            </label>
            <label
              class="radio-option"
              :class="{ 'radio-option-active': sourceType === 'OTHER' }"
            >
              <input
                v-model="sourceType"
                type="radio"
                name="sourceType"
                value="OTHER"
                class="radio-input"
              >
              <span class="radio-label">Other</span>
            </label>
          </div>
        </div>

        <!-- IMDB URL Input -->
        <div v-if="sourceType === 'IMDB'" class="form-section">
          <label class="form-label">IMDB URL</label>
          <input
            v-model="imdbUrl"
            type="url"
            placeholder="https://www.imdb.com/title/..."
            class="form-input"
          >
        </div>

        <!-- Other URL Input -->
        <div v-if="sourceType === 'OTHER'" class="form-section">
          <label class="form-label">URL</label>
          <input
            v-model="otherUrl"
            type="url"
            placeholder="https://..."
            class="form-input"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 24px 0 80px;
  width: 100%;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(55, 53, 47, 0.65);
}

@media (prefers-color-scheme: dark) {
  .breadcrumb {
    color: rgba(255, 255, 255, 0.45);
  }
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background 20ms ease-in;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.breadcrumb-item:hover {
  background: rgba(55, 53, 47, 0.08);
}

@media (prefers-color-scheme: dark) {
  .breadcrumb-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.breadcrumb-item-current {
  color: var(--color-text);
  cursor: default;
}

.breadcrumb-item-current:hover {
  background: transparent;
}

.breadcrumb-separator {
  flex-shrink: 0;
  color: rgba(55, 53, 47, 0.3);
  display: flex;
  align-items: center;
}

@media (prefers-color-scheme: dark) {
  .breadcrumb-separator {
    color: rgba(255, 255, 255, 0.3);
  }
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 40px;
  line-height: 1.2;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

/* Page Body */
.page-body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Form */
.form-container {
  max-width: 600px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.form-input::placeholder {
  color: rgba(55, 53, 47, 0.4);
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

  .form-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page {
    padding: 20px 0 60px;
  }

  .page-title {
    font-size: 32px;
  }

  .breadcrumb {
    font-size: 13px;
  }
}
</style>
