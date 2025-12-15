import type React from "react"
import type { SocialMediaType } from "../../../../../../types/utils/constants.types";
import { useSignupInfluencerStore } from "../../../../../../store/features/signupInfluencer";
import { getSocialMeta } from "../../../../../../constants/influencer/social-accounts.data";

interface Props {
  platform: SocialMediaType;
  mode: 'create' | 'edit';
  accountId?: string;
  goBack: () => void;
}

//TODO: useMemo for meta/existing

export const AccountDetailsForm: React.FC<Props> = ({ platform, mode, accountId, goBack }) => {
  const {saveAccount, removeAccount, accounts } = useSignupInfluencerStore();

  const meta = getSocialMeta(platform);
  const existing = mode === 'edit' ? accounts.find(a => a.clientId === accountId) : null;

  const handleSave = () => {
    saveAccount({
      clientId: existing?.clientId ?? crypto.randomUUID(),
      platform,
      username: 'test_username',
      link: 'https://',
    });
  };

  const handleRemove = () => {
    if (accountId) {
      removeAccount(accountId);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={goBack}>Go Back</button>
      <span>{meta?.label}</span>
      <button onClick={handleSave}>Set Account</button>
      <button onClick={handleRemove}>Remove Account</button>
    </div>
  )
}
