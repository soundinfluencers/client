import './_social-list.scss';
import { useInfluencerProfileStore } from '@/store/influencer/account-settings/useInfluencerProfileStore.ts';
import { SocialAccountsList } from '../../../components/social-accounts-list/SocialAccountsList';
import type { TSocialAccounts } from '@/types/user/influencer.types';

export const SocialList: React.FC = () => {
  const { profile } = useInfluencerProfileStore();

  const getProfileAccounts = (platform: TSocialAccounts) => {
    if (!profile) return [];
    
    return profile[platform].map((account) => ({
      username: account.username,
      accountId: account.accountId,
    }));
  }

  return (
    <div className="social-list">
      <div className='social-list__header'>
        <h3 className='social-list__title'>Social accounts</h3>
      </div>
      <SocialAccountsList getAccounts={getProfileAccounts} />
    </div>
  );
}