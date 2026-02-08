import { defineStore } from "pinia";



export const useAuthStore = defineStore("auth", () => {
  const auth = useAuth();
  const isLoggedIn = ref(false);
  const isInitialized = ref(false);

  async function login(password: string) {
    const [err, success] = await auth.login(password);
    if (err || success.error) return false;

    isLoggedIn.value = true;
    return true;
  }

  async function logout() {
    auth.logout();
    isLoggedIn.value = false;
  }

  async function check() {
    const [err, isValid] = await auth.status();
    
    isInitialized.value = true;
    isLoggedIn.value = (err || isValid?.error) ? false : Boolean(isValid.data);
    
    return isLoggedIn.value;
  }

  return { isLoggedIn, isInitialized, login, logout, check };
});
