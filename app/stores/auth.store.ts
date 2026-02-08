import { tryCatch } from "@eoussama/core";
import { defineStore } from "pinia";



export const useAuthStore = defineStore("auth", () => {
  const auth = useAuthApi();
  const isLoggedIn = ref(false);
  const isInitialized = ref(false);

  async function login() {
    isLoggedIn.value = true;
  }

  async function logout() {
    isLoggedIn.value = false;
  }

  async function check() {
    const [err, isValid] = await tryCatch(() => auth.status());

    isInitialized.value = true;
    isLoggedIn.value = (err || isValid?.error) ? false : Boolean(isValid.data);

    return isLoggedIn.value;
  }

  return { isLoggedIn, isInitialized, login, logout, check };
});
