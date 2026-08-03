import { create } from "zustand";
import type { User } from "@/types";

/**
 * Client-side session state. Holds only the user profile — never tokens,
 * passwords, or vault contents (those stay in the TanStack Query cache
 * scoped to server state, or in httpOnly cookies).
 */
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
