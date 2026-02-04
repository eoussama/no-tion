<template>
  <div class="database-form-skeleton">
    <div class="form-section">
      <div class="skeleton-label" />
      <div class="skeleton-tabs">
        <div class="skeleton-tab" />
        <div class="skeleton-tab" />
      </div>
    </div>

    <div class="form-section">
      <div class="skeleton-label" />
      <div class="skeleton-input" />
    </div>

    <div class="form-section">
      <div class="skeleton-label" />
      <div class="skeleton-input skeleton-input-large" />
    </div>

    <div class="form-section">
      <div class="skeleton-submit" />
    </div>
  </div>
</template>

<style scoped>
.database-form-skeleton {
  max-width: 800px;
  margin: 0;
  padding: 0;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
  margin-top: 40px;
}

.skeleton-label {
  height: 14px;
  width: 110px;
  background: var(--color-border);
  border-radius: 3px;
  margin-bottom: 12px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.skeleton-tabs {
  display: flex;
  gap: 16px;
}

.skeleton-tab {
  height: 36px;
  width: 130px;
  background: var(--color-border);
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.skeleton-input {
  height: 40px;
  width: 100%;
  max-width: 600px;
  background: var(--color-border);
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.skeleton-input-large {
  max-width: 100%;
}

.skeleton-submit {
  height: 40px;
  width: 140px;
  background: var(--color-border);
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.skeleton-label::before,
.skeleton-tab::before,
.skeleton-input::before,
.skeleton-submit::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255 255 255 / 10%) 50%,
    transparent 100%
  );
  animation: skeleton-shimmer 2s infinite;
}

@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@media (prefers-color-scheme: dark) {
  .skeleton-label::before,
  .skeleton-tab::before,
  .skeleton-input::before,
  .skeleton-submit::before {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255 255 255 / 5%) 50%,
      transparent 100%
    );
  }
}
</style>
