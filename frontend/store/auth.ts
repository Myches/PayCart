import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        if (typeof window !== "undefined") {
          localStorage.setItem("paycart_token", token);
          localStorage.setItem("paycart_user", JSON.stringify(user));
        }
      },
      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("paycart_token");
          localStorage.removeItem("paycart_user");
        }
      },
      isLoggedIn: () => !!get().token,
    }),
    { name: "paycart-auth" }
  )
);
