import { create } from "zustand";

interface AccountSettingsEdit {
  isEdit: boolean;
  onChangeEdit: () => void;

  isConfirm: boolean;
  setConfirm: () => void;

  isEmail: boolean;
  onChangeEmail: () => void;

  resetAll: () => void;
}

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
