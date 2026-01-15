import { useEffect } from "react";
import { useInfluenserSignupStore } from "../../../../../store/influencer/account-settings/useInfluenserSignupStore";
import { useAccountSetupStore } from "../../../../influencer/components/account-setup-form/store/useAccountSetupStore";
import { MainScreen } from "../influencer/signup-main-screen/MainScreen";
import { AccountSetupForm } from "../../../../influencer/components/account-setup-form/AccountSetupForm";

export const SignupInfluencer = () => {
  const { settingsMode, onResetAccountForm } = useAccountSetupStore();
  const { saveAccount, removeAccount } = useInfluenserSignupStore();

  useEffect(() => {
    onResetAccountForm();
  }, []);

  return (
    settingsMode.type === 'account' ? (
      <AccountSetupForm
        platform={settingsMode.platform}
        mode={settingsMode.mode}
        account={settingsMode.account}
        onSave={(data) => saveAccount(settingsMode.platform, data, settingsMode.accountId)}
        onRemove={() => {
          if (settingsMode.accountId !== undefined) {
            removeAccount(settingsMode.platform, settingsMode.accountId);
          }
        }}
        // accountId={settingsMode.accountId}
      />
    ) : (
      <MainScreen />
    )
  )
}