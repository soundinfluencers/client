import { create } from "zustand";
import type { TSettingMode } from "../types/account-setup.types";
import type { TSocialAccounts } from "@/types/user/influencer.types";

interface AccountSetupState {
  settingsMode: TSettingMode;
  onCreateAccount: (platform: TSocialAccounts) => void;
  onEditAccount: (platform: TSocialAccounts, accountIdentifier: string) => void;
  onResetAccountForm: () => void;
}

export const useAccountSetupStore = create<AccountSetupState>((set) => ({
  settingsMode: {
    type: "main",
    platform: undefined,
    accountIdentifier: undefined,
  },
  onCreateAccount: (platform) =>
    set({
      settingsMode: {
        type: "account",
        platform,
        accountIdentifier: undefined,
      },
    }),
  onEditAccount: (platform, accountIdentifier) =>
    set({
      settingsMode: {
        type: "account",
        platform,
        accountIdentifier,
      },
    }),
  onResetAccountForm: () =>
    set({
      settingsMode: {
        type: "main",
        platform: undefined,
        accountIdentifier: undefined,
      },
    }),
}));
