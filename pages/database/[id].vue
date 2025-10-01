<script setup lang="ts">
import type { TNotionWorkspaceData } from "~/core";
import { ChevronRight, Home, Loader2, X } from "lucide-vue-next";
import { DATABASES } from "~/core";



const route = useRoute();
const databaseId = route.params.id as string;

// Fetch database info from API
const { data } = await useFetch<TNotionWorkspaceData>("/api/notion/workspace");

// Find the database from the fetched data
const database = computed(() => data.value?.databases.find(db => db.id === databaseId));

// Find the database key name from constants (e.g., "CINEMA_TV")
const databaseKey = Object.entries(DATABASES).find(([_, id]) => id === databaseId)?.[0] || "";

// Use the actual database title from API, fallback to formatted key name
const databaseName = computed(() => database.value?.title || databaseKey.replace(/_/g, " ") || "Unknown");

// Form state
const sourceType = ref<"IMDB" | "OTHER">("IMDB");
const imdbUrl = ref("");
const otherUrl = ref("");
const imdbSearchQuery = ref("");
const imdbSearchResults = ref<Array<{
  id: string;
  primaryTitle: string;
  type: string;
  startYear?: number;
  primaryImage?: { url: string };
}>>([]);
const isSearching = ref(false);
const selectedImdbTitle = ref<{ id: string; primaryTitle: string; type: string; startYear?: number; primaryImage?: { url: string } } | null>(null);
const showResults = ref(false);
const autocompleteRef = ref<HTMLElement | null>(null);

// Debounced search function
async function searchImdb() {
  if (imdbSearchQuery.value.length < 2) {
    imdbSearchResults.value = [];
    showResults.value = false;

    return;
  }

  isSearching.value = true;
  showResults.value = true;

  try {
    const response = await $fetch<{ titles: Array<{
      id: string;
      primaryTitle: string;
      type: string;
      startYear?: number;
      primaryImage?: { url: string };
    }>; }>("/api/imdb/search", {
      params: { q: imdbSearchQuery.value },
    });

    imdbSearchResults.value = response.titles || [];
  }
  catch (error) {
    console.error("Search error:", error);
    imdbSearchResults.value = [];
  }
  finally {
    isSearching.value = false;
  }
}

// Debounce the search
let searchTimeout: ReturnType<typeof setTimeout>;

watch(imdbSearchQuery, () => {
  // Only search if we don't have a selected title or if query doesn't match
  if (!selectedImdbTitle.value || imdbSearchQuery.value !== getDisplayTitle(selectedImdbTitle.value)) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchImdb, 300);
  }
});

function getDisplayTitle(title: { primaryTitle: string; type: string; startYear?: number }) {
  return `${title.primaryTitle} (${title.startYear || "N/A"})`;
}

function formatTitleType(type: string): string {
  const typeMap: Record<string, string> = {
    movie: "Movie",
    tvSeries: "TV Series",
    tvMiniSeries: "TV Mini-Series",
    tvSpecial: "TV Special",
    tvMovie: "TV Movie",
    short: "Short",
    video: "Video",
    videoGame: "Video Game",
  };

  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

function selectTitle(title: { id: string; primaryTitle: string; type: string; startYear?: number; primaryImage?: { url: string } }) {
  selectedImdbTitle.value = title;
  imdbSearchQuery.value = getDisplayTitle(title);
  imdbUrl.value = `https://www.imdb.com/title/${title.id}/`;
  showResults.value = false;
  imdbSearchResults.value = [];
}

function dismissResults() {
  showResults.value = false;
}

function clearSelection() {
  selectedImdbTitle.value = null;
  imdbSearchQuery.value = "";
  imdbUrl.value = "";
  imdbSearchResults.value = [];
  showResults.value = false;
}

// Clear inputs when switching tabs
watch(sourceType, () => {
  // Clear IMDB inputs
  clearSelection();
  // Clear OTHER input
  otherUrl.value = "";
});

// Handle click outside
function handleClickOutside(event: MouseEvent) {
  if (autocompleteRef.value && !autocompleteRef.value.contains(event.target as Node)) {
    dismissResults();
  }
}

// Handle ESC key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    dismissResults();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});
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
        {{ databaseName }}
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
          <label class="form-label">Search IMDB Title</label>
          <div ref="autocompleteRef" class="autocomplete-container">
            <div class="input-wrapper">
              <input
                v-model="imdbSearchQuery"
                type="text"
                placeholder="Start typing a movie or TV show name..."
                class="form-input"
                @focus="() => { if (imdbSearchResults.length > 0) showResults = true; }"
              >
              <button
                v-if="selectedImdbTitle"
                type="button"
                class="clear-button"
                @click="clearSelection"
              >
                <X :size="16" />
              </button>
            </div>
            <div v-if="isSearching && showResults" class="autocomplete-loading">
              <Loader2 :size="16" class="spinner-icon" />
            </div>
            <div v-if="imdbSearchResults.length > 0 && showResults" class="autocomplete-results">
              <button
                v-for="title in imdbSearchResults"
                :key="title.id"
                type="button"
                class="autocomplete-item"
                @click="selectTitle(title)"
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
                    {{ formatTitleType(title.type) }} • {{ title.startYear || 'N/A' }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Selected Movie Details -->
        <div v-if="sourceType === 'IMDB' && selectedImdbTitle" class="form-section">
          <div class="movie-details">
            <div class="movie-details-form">
              <div class="form-field">
                <label class="form-label">Title</label>
                <input
                  v-model="selectedImdbTitle.primaryTitle"
                  type="text"
                  class="form-input"
                >
              </div>

              <div class="form-field">
                <label class="form-label">Type</label>
                <input
                  :value="formatTitleType(selectedImdbTitle.type)"
                  type="text"
                  class="form-input form-input-readonly"
                  readonly
                >
              </div>

              <div class="form-field">
                <label class="form-label">IMDB URL</label>
                <input
                  :value="imdbUrl"
                  type="text"
                  class="form-input form-input-readonly"
                  readonly
                >
              </div>
            </div>

            <div class="movie-details-poster">
              <div v-if="selectedImdbTitle.primaryImage?.url" class="movie-poster">
                <img :src="selectedImdbTitle.primaryImage.url" :alt="selectedImdbTitle.primaryTitle">
              </div>
              <div v-else class="movie-poster-placeholder">
                <span>No Poster</span>
              </div>
            </div>
          </div>
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
  max-width: 900px;
  width: 100%;
}

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

/* Autocomplete */
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

.autocomplete-item-meta {
  font-size: 12px;
  color: rgba(55, 53, 47, 0.65);
}

@media (prefers-color-scheme: dark) {
  .autocomplete-item-meta {
    color: rgba(255, 255, 255, 0.45);
  }
}

/* Movie Details */
.movie-details {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: white;
  border: 1px solid rgba(55, 53, 47, 0.16);
  border-radius: 3px;
  transition: background 20ms ease-in;
}

@media (prefers-color-scheme: dark) {
  .movie-details {
    background: rgba(255, 255, 255, 0.055);
    border-color: rgba(255, 255, 255, 0.094);
  }
}

.movie-details-poster {
  flex-shrink: 0;
  width: 100%;
  max-width: 250px;
}

.movie-poster {
  width: 100%;
  height: auto;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 3px;
}

.movie-poster-placeholder {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 3px;
  background: rgba(55, 53, 47, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(55, 53, 47, 0.45);
  text-align: center;
  padding: 16px;
}

@media (prefers-color-scheme: dark) {
  .movie-poster-placeholder {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.35);
  }
}

.movie-details-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.form-input-readonly {
  background: rgba(55, 53, 47, 0.04);
  cursor: default;
  color: rgba(55, 53, 47, 0.75);
}

.form-input-readonly:focus {
  box-shadow: none;
  border-color: rgba(55, 53, 47, 0.16);
}

@media (prefers-color-scheme: dark) {
  .form-input-readonly {
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.65);
  }

  .form-input-readonly:focus {
    border-color: rgba(255, 255, 255, 0.094);
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
