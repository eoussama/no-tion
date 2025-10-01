<template>
  <div class="app-container">
    <header class="topbar">
      <div class="topbar-content">
        <div class="topbar-left">
          <img alt="no-tion logo" class="logo" src="/logo.png">
          <span class="app-title">no-tion</span>
        </div>
      </div>
    </header>

    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--color-background);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-background);
  border-bottom: 1px solid rgba(55, 53, 47, 0.09);
  backdrop-filter: blur(8px);
}

@media (prefers-color-scheme: dark) {
  .topbar {
    border-bottom-color: rgba(255, 255, 255, 0.09);
  }
}

.topbar-content {
  width: 100%;
  padding: 0 96px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}

.app-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 96px;
}

@media (max-width: 1024px) {
  .topbar-content,
  .main-content {
    padding: 0 48px;
  }
}

@media (max-width: 768px) {
  .topbar-content {
    padding: 0 24px;
  }

  .main-content {
    padding: 0 24px;
  }
}
</style>
