<script setup lang="ts">
import type { TLogin } from "~~/core";

import { useForm } from "@tanstack/vue-form";
import { registerPage, SLoginForm } from "~~/core";



registerPage("Login");

const form = useForm({
  defaultValues: { password: "" } as TLogin,

  onSubmit: async (values): Promise<void> => {
    if (values.formApi.state.isValid) {
      await useAuthApi().login(form.state.values.password);
    }
  },
});
</script>

<template>
  <h1>Login</h1>

  <form @submit.prevent.stop="form.handleSubmit">
    <div>
      <form.Field
        name="password"
        :validators="{ onChange: SLoginForm.shape.password }"
      >
        <template #default="{ field }">
          <input
            type="password"
            :name="field.name"
            :value="field.state.value"
            @blur="field.handleBlur"
            @input="(e) => field.handleChange((e.target as HTMLInputElement).value)"
          >

          <ul>
            <li v-for="(error, index) in field.state.meta.errors" :key="index">
              <small>{{ error?.message }}</small>
            </li>
          </ul>
        </template>
      </form.Field>
    </div>

    <form.Subscribe>
      <template #default="{ canSubmit, isSubmitting }">
        <button type="submit" :disabled="!canSubmit">
          {{ isSubmitting ? "Logging-in" : "Login" }}
        </button>
      </template>
    </form.Subscribe>
  </form>
</template>
