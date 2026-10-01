<script lang="ts" setup>
const auth = useAuthStore();

const searchOpen = ref(false);
const loggingOut = ref(false);

async function onLogout(): Promise<void> {
  if (loggingOut.value) {
    return;
  }

  loggingOut.value = true;

  try {
    await auth.logout();
  }
  finally {
    loggingOut.value = false;
  }
}
</script>

<template>
  <UDashboardGroup unit="px" storage="local" storage-key="no-tion">
    <UDashboardSidebar
      id="sidebar"
      collapsible
      resizable
      mode="slideover"
      :default-size="240"
      :min-size="200"
      :max-size="360"
      :collapsed-size="56"
    >
      <template #header="{ collapsed }">
        <Workspace :collapsed="collapsed" @logout="onLogout" />
      </template>

      <template #default="{ collapsed }">
        <SidebarNav :collapsed="collapsed" @search="searchOpen = true" />
        <SidebarSettings :collapsed="collapsed" />
      </template>

      <template #footer="{ collapsed }">
        <SidebarFooter :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel id="main">
      <template #header>
        <UDashboardNavbar :toggle="{ color: 'neutral', variant: 'ghost', size: 'sm' }">
          <template #left>
            <UDashboardSidebarCollapse color="neutral" variant="ghost" size="sm" class="hidden text-muted lg:inline-flex" />
            <Breadcrumb />
          </template>

          <template #right>
            <div id="navbar-actions" class="flex items-center gap-1" />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <AppSearch v-model:open="searchOpen" />
  </UDashboardGroup>
</template>
