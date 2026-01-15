import { useUserStore } from '../../../../../store/influencer/account-settings/useUserStore';
import { SocialAccountsList } from '../../../components/social-accounts-list/SocialAccountsList';

import './_social-list.scss';

// interface Props {
//   userData: any;
// };

export const SocialList: React.FC = () => {
  const { user } = useUserStore();

  return (
    <div className="social-list">
      <div className='social-list__header'>
        <h3 className='social-list__title'>Social accounts</h3>
      </div>
      <SocialAccountsList user={user} />
    </div>
  );
}