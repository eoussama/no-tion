import { defineStore } from "pinia";



export const useAuthStore = defineStore("auth", () => {
  const auth = useAuth();
  const isLoggedIn = ref(false);

  async function login(password: string) {
    const [err, success] = await auth.login(password);
    if (err || success.error) return;

    isLoggedIn.value = true;
  }

  async function logout() {
    auth.logout();
    isLoggedIn.value = false;
  }

  async function check() {
    const [err, isValid] = await auth.status();
    if (err || isValid.error) return;
    
    isLoggedIn.value = Boolean(isValid.data);

    return isLoggedIn.value;
  }

  return { isLoggedIn, login, logout, check };
});
