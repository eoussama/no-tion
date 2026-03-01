<script setup lang="ts">
import type { TLogin } from "~~/core";

import { useForm } from "@tanstack/vue-form";
import { SLoginForm } from "~~/core";
import { version } from "../../package.json";



definePageMeta({ layout: "none" });

const form = useForm({
  defaultValues: { password: "" } satisfies TLogin,

  onSubmit: async (values): Promise<void> => {
    if (values.formApi.state.isValid) {
      await useAuthApi().login(form.state.values.password);
    }
  },
});
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <UCard variant="subtle" class="w-full max-w-90">
      <template #header>
        <div class="flex items-center justify-center my-6">
          <img src="/logo.png" alt="Logo" class="w-20 h-20 mb-4 rounded-lg m-0!">
        </div>
      </template>

      <div class="flex items-center justify-center">
        <UForm
          class="w-full"
          @submit.prevent.stop="form.handleSubmit"
        >
          <form.Field
            name="password"
            :validators="{ onChange: SLoginForm.shape.password }"
          >
            <template #default="{ field }">
              <UFormField
                required
                label="Password"
                class="mb-4 w-full"
                :error="field.state.meta.errors[0]?.message"
              >
                <UInput
                  size="xl"
                  class="w-full"
                  type="password"
                  placeholder="Enter instance password"
                  :name="field.name"
                  :value="field.state.value"
                  @blur="field.handleBlur"
                  @input="(e: InputEvent) => field.handleChange((e.target as HTMLInputElement).value)"
                />
              </UFormField>
            </template>
          </form.Field>

          <form.Subscribe>
            <template #default="{ canSubmit, isSubmitting }">
              <UButton
                block
                size="xl"
                type="submit"
                icon="i-lucide-log-in"
                :disabled="!canSubmit"
                :loading="isSubmitting"
                :label="isSubmitting ? 'Signing In' : 'Sign In'"
              />
            </template>
          </form.Subscribe>
        </UForm>
      </div>

      <template #footer>
        <UButton
          block
          variant="link"
          target="_blank"
          icon="i-lucide-github"
          to="http://git.ouss.es/no-tion"
        >
          View on GitHub
          <UBadge variant="soft">
            {{ version }}
          </UBadge>
        </UButton>
      </template>
    </UCard>
  </div>
</template>
