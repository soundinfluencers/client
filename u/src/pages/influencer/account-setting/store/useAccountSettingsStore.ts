import { create } from "zustand";

type AccountSettingsMode =
  | "view"
  | "edit-details"
  | "edit-password"
  | "send-email"
  | "new-password";

interface AccountSettingsState {
  mode: AccountSettingsMode;
  setMode: (mode: AccountSettingsMode) => void;
  resetMode: () => void;
}

export const useAccountSettingsStore = create<AccountSettingsState>((set) => ({
  mode: "view",
  setMode: (mode: AccountSettingsMode) => set({ mode }),
  resetMode: () => set({ mode: "view" }),
}));