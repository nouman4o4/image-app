import { IUserClient } from "@/types/interfaces"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UserState {
  user: IUserClient | null
  setUser: (user: IUserClient | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user: user }),
      clearUser: () => set({ user: null }),
    }),
    { name: "local_user" },
  ),
)
