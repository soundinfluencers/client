import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { IUser, UserRoleType } from "@/types/user/user.types";

interface UserStore {
  user: IUser | null;
  role: UserRoleType;
  hydrated: boolean;

  setUser: (data: IUser | null) => void;
  patchUser: (patch: Partial<IUser>) => void;

  setRole: (role: UserRoleType) => void;
  setHydrated: () => void;
}

export const useUser = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      role: "client",
      hydrated: false,

      setUser: (data) => set({ user: data }),
      patchUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : ({ ...patch } as IUser),
        })),
      setRole: (role) => set({ role }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({ user: state.user, role: state.role }),
    },
  ),
);
