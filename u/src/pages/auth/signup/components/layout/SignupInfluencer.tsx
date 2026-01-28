import { useEffect } from "react";
import { useInfluenserSignupStore } from "../../../../../store/influencer/account-settings/useInfluenserSignupStore";
import { useAccountSetupStore } from "../../../../influencer/components/account-setup-form/store/useAccountSetupStore";
import { MainScreen } from "../influencer/signup-main-screen/MainScreen";
import { AccountSetupForm } from "../../../../influencer/components/account-setup-form/AccountSetupForm";

export const SignupInfluencer = () => {
  const { settingsMode, onResetAccountForm } = useAccountSetupStore();
  const { user, saveAccount, removeAccount } = useInfluenserSignupStore();

  useEffect(() => {
    onResetAccountForm();
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
      }}
      onRemove={() => {
        if (idx !== undefined && !Number.isNaN(idx)) {
          removeAccount(settingsMode.platform, idx);
        }
      }}
    />
  );
};