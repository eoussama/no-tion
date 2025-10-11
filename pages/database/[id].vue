<script setup lang="ts">
import { AlertCircle, ChevronRight, ExternalLink, Home } from "lucide-vue-next";
import { computed } from "vue";

import ImdbDetailsForm from "~/components/database/ImdbDetailsForm.vue";
import ImdbSearch from "~/components/database/ImdbSearch.vue";
import OtherDetailsForm from "~/components/database/OtherDetailsForm.vue";
import SourceTypeSelector from "~/components/database/SourceTypeSelector.vue";
import ToastMessage from "~/components/ui/ToastMessage.vue";
import { useDatabaseForm } from "~/composables/useDatabaseForm";
import { useWorkspaceQuery } from "~/composables/useWorkspaceQuery";
import { DATABASES, MediaSourceType } from "~/core";



const route = useRoute();
const databaseId = route.params.id as string;

const {
  sourceType,
  imdbSearchQuery,
  imdbSearchResults,
  isSearching,
  selectedImdbTitle,
  imdbTitle,
  imdbType,
  imdbUrl,
  imdbPosterUrl,
  genre,
  otherForm,
  isSubmitting,
  toast,
  genreOptions,
  mediaTypeOptions,
  isFormValid,
  isMovieInDatabase,
  handleSearchRequest,
  selectImdbTitle,
  clearImdbSelection,
  handleSubmit,
} = useDatabaseForm(databaseId);

const { data } = useWorkspaceQuery();

const database = computed(() => data.value?.databases.find(db => db.id === databaseId));

const databaseKey = computed(() =>
  Object.entries(DATABASES).find(([, id]) => id === databaseId)?.[0] ?? "",
);

const databaseName = computed(() =>
  database.value?.title || databaseKey.value.replace(/_/g, " ") || "Unknown",
);

const notionUrl = computed(() =>
  database.value?.id ? `https://www.notion.so/${database.value.id.replace(/-/g, "")}` : "",
);

const isSelectedTitleInDatabase = computed(() =>
  selectedImdbTitle.value ? isMovieInDatabase(selectedImdbTitle.value.id) : false,
);
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
      <a
        v-if="notionUrl"
        :href="notionUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="notion-link-button"
        title="Open in Notion"
      >
        <span>Open in Notion</span>
        <ExternalLink :size="16" />
      </a>
    </div>

    <!-- Page Content -->
    <div class="page-body">
      <DatabaseFormSkeleton v-if="!database" />
      <div v-else class="form-container">
        <SourceTypeSelector v-model="sourceType" />

        <ImdbSearch
          v-if="sourceType === MediaSourceType.IMDB"
          v-model="imdbSearchQuery"
          :results="imdbSearchResults"
          :selected-title="selectedImdbTitle"
          :is-searching="isSearching"
          :is-movie-in-database="isMovieInDatabase"
          @select="selectImdbTitle"
          @clear="clearImdbSelection"
          @request-search="handleSearchRequest"
        />

        <div v-if="sourceType === MediaSourceType.IMDB && selectedImdbTitle" class="form-section">
          <ImdbDetailsForm
            v-model:title="imdbTitle"
            v-model:genre="genre"
            :type="imdbType"
            :imdb-url="imdbUrl"
            :poster-url="imdbPosterUrl"
            :genre-options="genreOptions"
          />
        </div>

        <div v-if="sourceType === MediaSourceType.OTHER" class="form-section">
          <OtherDetailsForm
            v-model:title="otherForm.title"
            v-model:type="otherForm.type"
            v-model:url="otherForm.url"
            v-model:poster-url="otherForm.posterUrl"
            v-model:genre="genre"
            :media-type-options="mediaTypeOptions"
            :genre-options="genreOptions"
          />
        </div>

        <div class="form-section">
          <div class="submit-section">
            <div
              v-if="sourceType === MediaSourceType.IMDB && isSelectedTitleInDatabase"
              class="duplicate-warning"
              title="This title is already in your database"
            >
              <AlertCircle :size="18" />
              <span>Already added</span>
            </div>
            <button
              type="button"
              :disabled="!isFormValid || isSubmitting"
              class="submit-button"
              @click="handleSubmit"
            >
              {{ isSubmitting ? 'Adding...' : 'Add Entry' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastMessage v-if="toast" :toast="toast" />
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 40px;
  line-height: 1.2;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.notion-link-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(55, 53, 47, 0.65);
  background: transparent;
  border: 1px solid rgba(55, 53, 47, 0.16);
  border-radius: 3px;
  text-decoration: none;
  transition: all 20ms ease-in;
  cursor: pointer;
}

.notion-link-button:hover {
  background: rgba(55, 53, 47, 0.08);
  color: var(--color-text);
}

@media (prefers-color-scheme: dark) {
  .notion-link-button {
    color: rgba(255, 255, 255, 0.45);
    border-color: rgba(255, 255, 255, 0.16);
  }

  .notion-link-button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }
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

/* Submit Section */
.submit-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.duplicate-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 3px;
  background: rgba(251, 191, 36, 0.1);
  color: rgb(217, 119, 6);
  font-size: 13px;
  font-weight: 500;
  cursor: help;
}

@media (prefers-color-scheme: dark) {
  .duplicate-warning {
    background: rgba(251, 191, 36, 0.15);
    color: rgb(251, 191, 36);
  }
}

/* Submit Button */
.submit-button {
  padding: 8px 16px;
  border-radius: 3px;
  border: none;
  background: #2383e2;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 20ms ease-in;
  align-self: flex-end;
}

.submit-button:hover:not(:disabled) {
  background: #1a6dc7;
}

.submit-button:disabled {
  background: rgba(55, 53, 47, 0.16);
  color: rgba(55, 53, 47, 0.4);
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .submit-button:disabled {
    background: rgba(255, 255, 255, 0.094);
    color: rgba(255, 255, 255, 0.3);
  }
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

@media (max-width: 768px) {
  .movie-details {
    flex-direction: column;
  }
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

@media (max-width: 768px) {
  .movie-details-poster {
    max-width: 100%;
    order: 2;
  }

  .movie-details-form {
    order: 1;
  }
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

/* Toast Notification */
.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
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

/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>

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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 40px;
  line-height: 1.2;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.notion-link-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(55, 53, 47, 0.65);
  background: transparent;
  border: 1px solid rgba(55, 53, 47, 0.16);
  border-radius: 3px;
  text-decoration: none;
  transition: all 20ms ease-in;
  cursor: pointer;
}

.notion-link-button:hover {
  background: rgba(55, 53, 47, 0.08);
  color: var(--color-text);
}

@media (prefers-color-scheme: dark) {
  .notion-link-button {
    color: rgba(255, 255, 255, 0.45);
    border-color: rgba(255, 255, 255, 0.16);
  }

  .notion-link-button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }
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

/* Submit Section */
.submit-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.duplicate-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 3px;
  background: rgba(251, 191, 36, 0.1);
  color: rgb(217, 119, 6);
  font-size: 13px;
  font-weight: 500;
  cursor: help;
}

@media (prefers-color-scheme: dark) {
  .duplicate-warning {
    background: rgba(251, 191, 36, 0.15);
    color: rgb(251, 191, 36);
  }
}

/* Submit Button */
.submit-button {
  padding: 8px 16px;
  border-radius: 3px;
  border: none;
  background: #2383e2;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 20ms ease-in;
  align-self: flex-end;
}

.submit-button:hover:not(:disabled) {
  background: #1a6dc7;
}

.submit-button:disabled {
  background: rgba(55, 53, 47, 0.16);
  color: rgba(55, 53, 47, 0.4);
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .submit-button:disabled {
    background: rgba(255, 255, 255, 0.094);
    color: rgba(255, 255, 255, 0.3);
  }
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

.autocomplete-item.autocomplete-item-exists {
  opacity: 0.6;
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

@media (max-width: 768px) {
  .movie-details {
    flex-direction: column;
  }
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

@media (max-width: 768px) {
  .movie-details-poster {
    max-width: 100%;
    order: 2;
  }

  .movie-details-form {
    order: 1;
  }
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

/* Toast Notification */
.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
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

/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
