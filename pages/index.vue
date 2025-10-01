<script setup lang="ts">
const { data, error: fetchError, pending } = await useFetch("/api/notion/workspace");

const user = computed(() => data.value?.user || null);
const databases = computed(() => data.value?.databases || []);
const loading = computed(() => pending.value);
const error = computed(() => fetchError.value?.statusMessage || null);

async function refetch() {
  await refreshNuxtData();
}
</script>

<template>
  <div class="page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-icon">
        <img src="/logo.png" alt="no-tion">
      </div>
      <h1 class="page-title">
        no-tion Dashboard
      </h1>
    </div>

    <!-- Page Content -->
    <div class="page-body">
      <!-- Workspace Info -->
      <div class="section">
        <div v-if="loading" class="loading-state">
          <div class="spinner" />
          <span>Loading workspace...</span>
        </div>

        <div v-else-if="error" class="callout callout-warning">
          <div class="callout-icon">
            ⚠️
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

        <div v-else-if="user" class="workspace-info">
          <div class="info-row">
            <span class="info-label">Workspace</span>
            <div class="info-value">
              <div class="user-badge">
                <div v-if="user.avatarUrl" class="user-avatar">
                  <img :src="user.avatarUrl" :alt="user.name">
                </div>
                <div v-else class="user-avatar user-avatar-fallback">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <span class="user-name">{{ user.name }}</span>
              </div>
            </div>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <div class="info-value">
              <span class="status-badge status-connected">
                <span class="status-dot" />
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Databases Section -->
      <div v-if="!error" class="section">
        <h2 class="section-heading">
          Databases
        </h2>

        <div v-if="loading" class="loading-state">
          <div class="spinner" />
          <span>Loading databases...</span>
        </div>

        <div v-else-if="databases.length === 0" class="empty-state">
          <div class="empty-icon">
            📋
          </div>
          <div class="empty-title">
            No databases found
          </div>
          <div class="empty-text">
            Make sure your integration has access to databases in your Notion workspace.
          </div>
        </div>

        <div v-else class="database-list">
          <div
            v-for="db in databases"
            :key="db.id"
            class="database-item"
          >
            <div class="database-item-icon">
              {{ db.icon || '📊' }}
            </div>
            <div class="database-item-content">
              <div class="database-item-title">
                {{ db.title }}
              </div>
              <div class="database-item-meta">
                Last edited {{ db.lastEditedTime }}
              </div>
            </div>
            <button class="database-item-action">
              <span>Open</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 60px 0 80px;
  width: 100%;
}

/* Page Header */
.page-header {
  margin-bottom: 48px;
}

.page-icon {
  margin-bottom: 8px;
}

.page-icon img {
  width: 78px;
  height: 78px;
  border-radius: 3px;
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

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(55, 53, 47, 0.16);
  border-top-color: rgba(55, 53, 47, 0.65);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@media (prefers-color-scheme: dark) {
  .spinner {
    border-color: rgba(255, 255, 255, 0.16);
    border-top-color: rgba(255, 255, 255, 0.65);
  }
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
  font-size: 18px;
  line-height: 1.5;
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

/* Workspace Info */
.workspace-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 32px;
  font-size: 14px;
}

.info-label {
  min-width: 120px;
  color: rgba(55, 53, 47, 0.65);
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .info-label {
    color: rgba(255, 255, 255, 0.45);
  }
}

.info-value {
  color: var(--color-text);
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(55, 53, 47, 0.16) 0%, rgba(55, 53, 47, 0.08) 100%);
  color: var(--color-text);
  font-size: 12px;
  font-weight: 600;
}

.user-name {
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.status-connected {
  background: rgba(38, 178, 119, 0.15);
  color: rgb(0, 135, 107);
}

@media (prefers-color-scheme: dark) {
  .status-connected {
    background: rgba(38, 178, 119, 0.2);
    color: rgb(77, 201, 155);
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
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
  border: none;
  border-radius: 3px;
  cursor: pointer;
  opacity: 0;
  transition: all 20ms ease-in;
  font-family: inherit;
}

.database-item:hover .database-item-action {
  opacity: 1;
}

.database-item-action:hover {
  background: rgba(55, 53, 47, 0.08);
  color: var(--color-text);
}

@media (prefers-color-scheme: dark) {
  .database-item-action {
    color: rgba(255, 255, 255, 0.45);
  }

  .database-item-action:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.81);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page {
    padding: 40px 0 60px;
  }

  .page-icon img {
    width: 64px;
    height: 64px;
  }

  .page-title {
    font-size: 32px;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-label {
    min-width: auto;
  }
}
</style>
