import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  userName: string;
  email: string;
  role: "customer" | "seller";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserStore = {
  user: User | undefined;
  setUser: (user: User | undefined) => void;
  clearUser: () => void;  // optional: to clear user on logout
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: undefined,
      setUser: (u) => set({ user: u }),
      clearUser: () => set({ user: undefined }),
    }),
    {
      name: "user-storage", // key name in localStorage
      // You can optionally serialize/deserialize here if needed,
      // but default works fine for JSON-serializable data.
    }
  )
);
