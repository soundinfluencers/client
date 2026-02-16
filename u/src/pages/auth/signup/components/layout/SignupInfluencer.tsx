import { useEffect } from "react";
import {
  useInfluencerSignupStore,
} from "@/store/influencer/account-settings/useInfluenserSignupStore.ts";
import { useAccountSetupStore } from "@/pages/influencer/components/account-setup-form/store/useAccountSetupStore.ts";
import { MainScreen } from "../influencer/signup-main-screen/MainScreen";
import { AccountSetupForm } from "../../../../influencer/components/account-setup-form/AccountSetupForm";

export const SignupInfluencer = () => {
  const { settingsMode, onResetAccountForm } = useAccountSetupStore();
  const { user, saveAccount, removeAccount } = useInfluencerSignupStore();

  // Reset on unmount
  useEffect(() => {
    return () => {
      onResetAccountForm();
    }
  }, [onResetAccountForm]);

  if (settingsMode.type !== 'account') {
    return (
      <MainScreen />
    );
  }

  const { platform, accountIdentifier } = settingsMode;

  const idx = accountIdentifier === undefined ? undefined : Number(accountIdentifier);
  const account = idx === undefined || Number.isNaN(idx) ? undefined : user[platform][idx];

  return (
    <AccountSetupForm
      platform={settingsMode.platform}
      account={account}
      onSave={(data) => {
        saveAccount(settingsMode.platform, data, idx);
        onResetAccountForm();
      }}
      onRemove={() => {
        if (idx !== undefined && !Number.isNaN(idx)) {
          removeAccount(settingsMode.platform, idx);
          onResetAccountForm();
        }
      }}
    />
  );
};