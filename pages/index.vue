<script setup lang="ts">
import type { TNullable } from "@eoussama/core";
import type { TNotionWorkspaceData } from "~/core";
import { AlertCircle, ChevronRight, Database, Loader2 } from "lucide-vue-next";



const { data, error: fetchError, pending } = useFetch<TNotionWorkspaceData>("/api/notion/workspace", {
  lazy: true,
});

const databases = computed(() => data.value?.databases || []);
const loading = computed(() => pending.value);
const error = computed(() => (fetchError.value?.statusMessage || null) as TNullable<string>);

async function refetch() {
  await refreshNuxtData();
}
</script>

<template>
  <div class="page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <div class="breadcrumb-item breadcrumb-item-current">
        <span>Home</span>
      </div>
    </nav>

    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        Dashboard
      </h1>
    </div>

    <!-- Page Content -->
    <div class="page-body">
      <!-- Error State -->
      <div v-if="error" class="callout callout-warning">
        <div class="callout-icon">
          <AlertCircle :size="20" />
        </div>
        <div class="callout-content">
          <div class="callout-title">
            Configuration Required
          </div>
          <div class="callout-text">
            {{ error }}
          </div>
          <button class="notion-button" @click="refetch">
            Retry Connection
          </button>
        </div>
      </div>

      <!-- Databases Section -->
      <div v-if="!error" class="section">
        <h2 class="section-heading">
          Databases
        </h2>

        <div v-if="loading" class="loading-state">
          <Loader2 :size="20" class="spinner-icon" />
          <span>Loading databases...</span>
        </div>

        <div v-else-if="databases.length === 0" class="empty-state">
          <div class="empty-icon">
            <Database :size="48" />
          </div>
          <div class="empty-title">
            No databases found
          </div>
          <div class="empty-text">
            Make sure your integration has access to databases in your Notion workspace.
          </div>
        </div>

        <div v-else class="database-list">
          <NuxtLink
            v-for="db in databases"
            :key="db.id"
            :to="`/database/${db.id}`"
            class="database-item"
          >
            <div class="database-item-icon">
              <span v-if="db.icon">{{ db.icon }}</span>
              <Database v-else :size="18" class="database-icon-fallback" />
            </div>
            <div class="database-item-content">
              <div class="database-item-title">
                {{ db.title }}
              </div>
              <div class="database-item-meta">
                Last edited {{ db.lastEditedTime }}
              </div>
            </div>
            <div class="database-item-action">
              <span>Open</span>
              <ChevronRight :size="12" />
            </div>
          </NuxtLink>
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

/* Section */
.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-heading {
  font-size: 14px;
  font-weight: 600;
  color: rgba(55, 53, 47, 0.65);
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (prefers-color-scheme: dark) {
  .section-heading {
    color: rgba(255, 255, 255, 0.45);
  }
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  color: rgba(55, 53, 47, 0.65);
  font-size: 14px;
}

@media (prefers-color-scheme: dark) {
  .loading-state {
    color: rgba(255, 255, 255, 0.45);
  }
}

.spinner-icon {
  flex-shrink: 0;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Callout */
.callout {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 3px;
  background: rgba(251, 243, 219, 0.3);
  border: 1px solid rgba(251, 243, 219, 0);
}

@media (prefers-color-scheme: dark) {
  .callout {
    background: rgba(73, 67, 48, 0.3);
  }
}

.callout-warning {
  background: rgba(251, 243, 219, 0.3);
}

@media (prefers-color-scheme: dark) {
  .callout-warning {
    background: rgba(73, 67, 48, 0.3);
  }
}

.callout-icon {
  flex-shrink: 0;
  color: rgba(55, 53, 47, 0.65);
}

@media (prefers-color-scheme: dark) {
  .callout-icon {
    color: rgba(255, 255, 255, 0.65);
  }
}

.callout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.callout-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.callout-text {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(55, 53, 47, 0.65);
}

@media (prefers-color-scheme: dark) {
  .callout-text {
    color: rgba(255, 255, 255, 0.65);
  }
}

/* Notion Button */
.notion-button {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  background: rgba(55, 53, 47, 0.08);
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background 20ms ease-in;
  font-family: inherit;
}

.notion-button:hover {
  background: rgba(55, 53, 47, 0.16);
}

@media (prefers-color-scheme: dark) {
  .notion-button {
    background: rgba(255, 255, 255, 0.08);
  }

  .notion-button:hover {
    background: rgba(255, 255, 255, 0.16);
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.4;
  color: rgba(55, 53, 47, 0.65);
}

@media (prefers-color-scheme: dark) {
  .empty-icon {
    color: rgba(255, 255, 255, 0.45);
  }
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(55, 53, 47, 0.65);
  max-width: 400px;
}

@media (prefers-color-scheme: dark) {
  .empty-text {
    color: rgba(255, 255, 255, 0.45);
  }
}

/* Database List */
.database-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.database-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 3px;
  cursor: pointer;
  transition: background 20ms ease-in;
  min-height: 42px;
  text-decoration: none;
  color: inherit;
}

.database-item:hover {
  background: rgba(55, 53, 47, 0.08);
}

@media (prefers-color-scheme: dark) {
  .database-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.database-item-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.database-icon-fallback {
  color: rgba(55, 53, 47, 0.45);
}

@media (prefers-color-scheme: dark) {
  .database-icon-fallback {
    color: rgba(255, 255, 255, 0.35);
  }
}

.database-item-content {
  flex: 1;
  min-width: 0;
}

.database-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.database-item-meta {
  font-size: 12px;
  color: rgba(55, 53, 47, 0.65);
  margin-top: 2px;
}

@media (prefers-color-scheme: dark) {
  .database-item-meta {
    color: rgba(255, 255, 255, 0.45);
  }
}

.database-item-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(55, 53, 47, 0.65);
  background: transparent;
  border-radius: 3px;
  opacity: 0;
  transition: opacity 20ms ease-in;
  font-family: inherit;
}

.database-item:hover .database-item-action {
  opacity: 1;
}

@media (prefers-color-scheme: dark) {
  .database-item-action {
    color: rgba(255, 255, 255, 0.45);
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
