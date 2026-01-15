import { useAccountSetupStore } from '../account-setup-form/store/useAccountSetupStore';
import { AccountsList } from './accounts-list/AccountsList';
import plus from '@/assets/icons/plus.svg';

import type { ISignupInfluencerDraft } from '../../../../types/user/influencer.types';
import './_social-accounts-list.scss';
import { SOCIAL_ACCOUNTS_DATA } from './data/social-account.data';

interface Props {
  user: ISignupInfluencerDraft;
}

export const SocialAccountsList: React.FC<Props> = ({ user }) => {
  const { onCreateAccount } = useAccountSetupStore();

  return (
    <ul className="social-accounts-list">
      {SOCIAL_ACCOUNTS_DATA.map(({ id, label, icon }) => (
        <li className="social-accounts-list__item" key={id}>
          <div className="social-accounts-list__item-content">
            <div className="social-accounts-list__item-meta">
              <img className="social-accounts-list__item-icon" src={icon} alt={label} />
              <p className="social-accounts-list__item-label">{label}</p>
            </div>
            <button
              className="social-accounts-list__item-create"
              onClick={() => onCreateAccount(id)}
            >
              <img src={plus} alt="Plus" />
            </button>
          </div>
          {user[id] && user[id].length > 0 && (
            <AccountsList id={id} user={user} />
          )}
        </li>
      ))}
    </ul>
  );
};