<script setup lang="ts">
import type { TImdbTitle, TNullable } from "~/core";
import { CheckCircle, Loader2, X } from "lucide-vue-next";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";



const props = defineProps<{
  modelValue: string;
  results: Array<TImdbTitle>;
  selectedTitle: TNullable<TImdbTitle>;
  isSearching: boolean;
  isMovieInDatabase: (id: string) => boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "select", value: TImdbTitle): void;
  (event: "clear"): void;
  (event: "requestSearch"): void;
}>();

const query = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit("update:modelValue", value);
    emit("requestSearch");
  },
});

const containerRef = ref<HTMLElement | null>(null);
const showResults = ref(false);

function openResults() {
  showResults.value = props.results.length > 0;
}

function closeResults() {
  showResults.value = false;
}

watch(
  () => props.results.length,
  (length) => {
    if (length === 0) {
      closeResults();
    }
    else if (query.value.length >= 2) {
      showResults.value = true;
    }
  },
);

watch(
  () => props.isSearching,
  (isLoading) => {
    if (isLoading && query.value.length >= 2) {
      showResults.value = true;
    }
  },
);

function handleClickOutside(event: MouseEvent) {
  if (!containerRef.value) {
    return;
  }

  if (!containerRef.value.contains(event.target as Node)) {
    closeResults();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeResults();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});

const shouldDisplayDropdown = computed(() => showResults.value && props.results.length > 0);
</script>

<template>
  <div ref="containerRef" class="form-section">
    <label class="form-label">Search IMDB Title</label>
    <div class="autocomplete-container">
      <div class="input-wrapper">
        <input
          v-model="query"
          type="text"
          placeholder="Start typing a movie or TV show name..."
          class="form-input"
          @focus="openResults"
        >
        <button
          v-if="props.selectedTitle"
          type="button"
          class="clear-button"
          @click="emit('clear')"
        >
          <X :size="16" />
        </button>
      </div>
      <div v-if="props.isSearching && showResults" class="autocomplete-loading">
        <Loader2 :size="16" class="spinner-icon" />
      </div>
      <div v-if="shouldDisplayDropdown" class="autocomplete-results">
        <button
          v-for="title in props.results"
          :key="title.id"
          type="button"
          class="autocomplete-item"
          :class="{ 'autocomplete-item-exists': props.isMovieInDatabase(title.id) }"
          @click="emit('select', title)"
        >
          <div v-if="title.primaryImage?.url" class="autocomplete-item-poster">
            <img :src="title.primaryImage.url" :alt="title.primaryTitle">
          </div>
          <div v-else class="autocomplete-item-poster-placeholder">
            <span>No Image</span>
          </div>
          <div class="autocomplete-item-content">
            <div class="autocomplete-item-title">
              {{ title.primaryTitle }}
            </div>
            <div class="autocomplete-item-meta">
              {{ title.type }}
              <span v-if="title.startYear"> • {{ title.startYear }}</span>
              <span v-if="title.runtimeSeconds"> • {{ Math.round(title.runtimeSeconds / 60) }} min</span>
              <span v-if="title.rating?.aggregateRating"> • {{ title.rating.aggregateRating.toFixed(1) }}</span>
            </div>
          </div>
          <div v-if="props.isMovieInDatabase(title.id)" class="exists-icon" title="Already in database">
            <CheckCircle :size="18" />
          </div>
        </button>
      </div>
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

.autocomplete-container {
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .form-input {
  padding-right: 40px;
}

.clear-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color: rgba(55, 53, 47, 0.45);
  transition: all 20ms ease-in;
}

.clear-button:hover {
  background: rgba(55, 53, 47, 0.08);
  color: rgba(55, 53, 47, 0.65);
}

@media (prefers-color-scheme: dark) {
  .clear-button {
    color: rgba(255, 255, 255, 0.35);
  }

  .clear-button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.55);
  }
}

.autocomplete-loading {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 3px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.autocomplete-loading .spinner-icon {
  color: rgba(55, 53, 47, 0.65);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-color-scheme: dark) {
  .autocomplete-loading {
    background: rgba(32, 32, 32, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .autocomplete-loading .spinner-icon {
    color: rgba(255, 255, 255, 0.45);
  }
}

.autocomplete-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 3px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

@media (prefers-color-scheme: dark) {
  .autocomplete-results {
    background: rgba(32, 32, 32, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
}

.autocomplete-item {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 20ms ease-in;
  text-align: left;
  font-family: inherit;
  border-bottom: 1px solid rgba(55, 53, 47, 0.09);
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item:hover {
  background: rgba(55, 53, 47, 0.06);
}

@media (prefers-color-scheme: dark) {
  .autocomplete-item {
    border-bottom-color: rgba(255, 255, 255, 0.09);
  }

  .autocomplete-item:hover {
    background: rgba(255, 255, 255, 0.06);
  }
}

.autocomplete-item-poster {
  width: 50px;
  height: 75px;
  flex-shrink: 0;
  border-radius: 3px;
  overflow: hidden;
  background: rgba(55, 53, 47, 0.08);
}

.autocomplete-item-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (prefers-color-scheme: dark) {
  .autocomplete-item-poster {
    background: rgba(255, 255, 255, 0.08);
  }
}

.autocomplete-item-poster-placeholder {
  width: 50px;
  height: 75px;
  flex-shrink: 0;
  border-radius: 3px;
  background: rgba(55, 53, 47, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.autocomplete-item-poster-placeholder span {
  font-size: 10px;
  color: rgba(55, 53, 47, 0.45);
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .autocomplete-item-poster-placeholder {
    background: rgba(255, 255, 255, 0.08);
  }

  .autocomplete-item-poster-placeholder span {
    color: rgba(255, 255, 255, 0.35);
  }
}

.autocomplete-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.autocomplete-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 2px;
}

@media (prefers-color-scheme: dark) {
  .autocomplete-item-title {
    color: rgba(255, 255, 255, 0.9);
  }
}

.autocomplete-item-exists {
  opacity: 0.6;
}

.autocomplete-item-exists:hover {
  opacity: 0.8;
}

.autocomplete-item-meta {
  font-size: 12px;
  color: rgba(55, 53, 47, 0.65);
}

@media (prefers-color-scheme: dark) {
  .autocomplete-item-meta {
    color: rgba(255, 255, 255, 0.45);
  }
}

.exists-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(34, 197, 94);
  margin-left: 8px;
}

@media (prefers-color-scheme: dark) {
  .exists-icon {
    color: rgb(74, 222, 128);
  }
}
</style>
