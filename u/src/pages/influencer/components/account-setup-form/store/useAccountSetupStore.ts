import { create } from "zustand";
import type { ISocialAccountFormValues, TSettingMode, TSocialAccounts } from "../types/account-setup.types";

//TODO: fix type for account where possible

interface AccountSetupState {
  settingsMode: TSettingMode;
  onCreateAccount: (platform: TSocialAccounts) => void;
  onEditAccount: (
    platform: TSocialAccounts,
    account?: ISocialAccountFormValues,
    index?: number
  ) => void;
  onResetAccountForm: () => void;
};

export const useAccountSetupStore = create<AccountSetupState>((set) => ({
  settingsMode: { type: 'main' },
  onCreateAccount: (platform: TSocialAccounts) => set({
    settingsMode: {
      type: 'account',
      mode: 'create',
      platform,
    }
  }),
  onEditAccount: (platform: TSocialAccounts, account?: ISocialAccountFormValues, index?: number) => set({
    settingsMode: {
      type: 'account',
      mode: 'edit',
      platform,
      account: account,
      accountId: index,
    }
  }),
  onResetAccountForm: () => set({ settingsMode: { type: 'main' } }),
}));