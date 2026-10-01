<script setup lang="ts">
import type { TLogin } from "~~/core";

import { useForm } from "@tanstack/vue-form";
import { SLoginForm, tryCatch } from "~~/core";
import AppField from "~/components/form/AppField.vue";
import { version } from "../../package.json";



definePageMeta({ layout: "none" });
useHead({ title: "Log in" });

const auth = useAuthStore();
const colorMode = useColorMode();
const loginError = ref<string | null>(null);
const reveal = ref(false);

const form = useForm({
  defaultValues: { password: "" } satisfies TLogin,

  onSubmit: async ({ value, formApi }): Promise<void> => {
    if (!formApi.state.isValid) {
      return;
    }

    loginError.value = null;

    const [err] = await tryCatch(() => auth.login(value.password));

    if (err) {
      loginError.value = getErrorMessage(err, "Unable to sign in");

      return;
    }

    await navigateTo("/");
  },
});

const isDark = computed(() => colorMode.value === "dark");

function toggleColorMode(): void {
  colorMode.preference = isDark.value ? "light" : "dark";
}
</script>

<template>
  <div class="relative flex min-h-svh flex-col items-center justify-center bg-default px-4 py-16 text-default">
    <UButton
      color="neutral"
      variant="ghost"
      class="absolute end-4 top-3.5 text-muted"
      :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleColorMode"
    />

    <form class="flex w-full max-w-80 flex-col" novalidate @submit.prevent.stop="form.handleSubmit">
      <img src="/logo.png" alt="no-tion" class="size-16 self-center rounded-[14px] object-cover shadow-[0_0_0_1px_var(--ui-border),0_2px_6px_rgba(15,15,15,0.08)]">

      <h1 class="mt-6 mb-1.5 text-center text-[22px] leading-snug font-bold">
        Log in to no-tion
      </h1>
      <p class="mb-7 text-center text-muted">
        This instance is private. Enter its password.
      </p>

      <form.Field name="password" :validators="{ onChange: SLoginForm.shape.password }">
        <template #default="{ field }">
          <AppField
            :field="field"
            :type="reveal ? 'text' : 'password'"
            size="lg"
            label="Password"
            placeholder="Enter password"
            autocomplete="current-password"
            autofocus
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                class="text-muted"
                :icon="reveal ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="reveal ? 'Hide password' : 'Show password'"
                :aria-pressed="reveal"
                @click="reveal = !reveal"
              />
            </template>
          </AppField>
        </template>
      </form.Field>

      <p v-if="loginError" role="alert" class="mt-3 flex items-center gap-2 rounded-md bg-tag-red px-2.5 py-2 text-[13px] text-tag-text">
        <UIcon name="i-lucide-circle-alert" class="size-4 shrink-0" />
        {{ loginError }}
      </p>

      <form.Subscribe>
        <template #default="{ canSubmit, isSubmitting }">
          <UButton
            block
            size="lg"
            type="submit"
            class="mt-3.5 h-9 justify-center"
            :disabled="!canSubmit"
            :loading="isSubmitting"
            :label="isSubmitting ? 'Signing in' : 'Continue'"
          />
        </template>
      </form.Subscribe>
    </form>

    <footer class="absolute inset-x-0 bottom-6 flex justify-center gap-2 text-xs text-muted">
      <span>v{{ version }}</span>
      <span aria-hidden="true">·</span>
      <a href="http://git.ouss.es/no-tion" target="_blank" rel="noopener noreferrer" class="focus-ring rounded-sm underline-offset-2 hover:text-default hover:underline">Source on GitHub</a>
    </footer>
  </div>
</template>
