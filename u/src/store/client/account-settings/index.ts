import type { AccountSettingsEdit } from "@/types/store/index.types";
import { create } from "zustand";

export const useAccountChange = create<AccountSettingsEdit>((set) => ({
  isEdit: false,
  onChangeEdit: () => {
    set((state) => ({
      isEdit: !state.isEdit,
    }));
  },
  isEmail: false,
  onChangeEmail: () => {
    set((state) => ({
      isEmail: !state.isEmail,
    }));
  },
  isConfirm: false,
  setConfirm: () => {
    set((state) => ({
      isConfirm: !state.isConfirm,
    }));
  },
  resetAll: () => set({ isEdit: false, isEmail: false, isConfirm: false }),
}));
