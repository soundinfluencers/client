import React from "react";
import { useAccountSetupStore } from '../account-setup-form/store/useAccountSetupStore';
import { AccountsList } from './accounts-list/AccountsList';
import { SOCIAL_ACCOUNTS_DATA } from './data/social-account.data';
import type { TSocialAccounts, TSocialAccountShort } from '@/types/user/influencer.types.ts';

import plus from '@/assets/icons/plus.svg';
import './_social-accounts-list.scss';

interface Props {
  getAccounts: (platform: TSocialAccounts) => TSocialAccountShort[];
}

export const SocialAccountsList: React.FC<Props> = ({ getAccounts }) => {
  const { onCreateAccount } = useAccountSetupStore();

  return (
    <ul className="social-accounts-list">
      {SOCIAL_ACCOUNTS_DATA.map(({ id, label, icon }) => {
        const accounts = getAccounts(id);

        return (
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
                Add
                <img  src={plus} alt="Plus" />
              </button>
            </div>
            {accounts.length > 0 && (
              <AccountsList id={id} accounts={accounts} />
            )}
          </li>
        );
      })}
    </ul>
  );
};