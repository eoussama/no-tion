import { defineStore } from "pinia";



export const useAuthStore = defineStore("auth", () => {
  const auth = useAuth();
  const isLoggedIn = ref(false);

  async function login(password: string) {
    const [err, success] = await auth.login(password);
    if (err || !success) return;

    isLoggedIn.value = true;
  }

  async function logout() {
    auth.logout();
    isLoggedIn.value = false;
  }

  return { isLoggedIn, login, logout };
});
