import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import type { User } from "@pravaas/types";

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  setAuth: (token: string, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const TOKEN_KEY = "pravaas_token";
const USER_KEY = "pravaas_user";

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,

  setAuth: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ token, user });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ token: null, user: null });
  },

  hydrate: async () => {
    try {
      console.log("HYDRATE START");
  
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);
  
      console.log("TOKEN =", token);
      console.log("USER =", userJson);
  
      const user = userJson
        ? JSON.parse(userJson)
        : null;
  
      console.log("HYDRATE SUCCESS");
  
      set({
        token,
        user,
        isHydrated: true,
      });
    } catch (err) {
      console.error("HYDRATE ERROR", err);
  
      set({
        token: null,
        user: null,
        isHydrated: true,
      });
    }
  },
}))