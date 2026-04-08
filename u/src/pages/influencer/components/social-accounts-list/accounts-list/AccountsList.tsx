import React from "react";
import { useAccountSetupStore } from '../../account-setup-form/store/useAccountSetupStore';
import { EditButton } from '@components/ui/edit-button/EditButton.tsx';
// import { Navigate } from "react-router-dom";
import type {
  TSocialAccounts,
  TSocialAccountShort,
} from '@/types/user/influencer.types.ts';
import refreshIcon from '@/assets/icons/refresh-ccw.svg';

import './_accounts-list.scss';
import { useSocialAccountStatusStore } from "@/pages/influencer/social-accounts/store/store.ts";

interface Props {
  id: TSocialAccounts;
  accounts: TSocialAccountShort[];
}

export const AccountsList: React.FC<Props> = ({ id, accounts }) => {
  const { onEditAccount } = useAccountSetupStore();
  const { setIsModalOpen, setAccountId, setSocialMedia } = useSocialAccountStatusStore();

  const renderEditButton = (account: TSocialAccountShort, index: number) => (
    <EditButton
      variants="social"
      onClick={() => {
        onEditAccount(id, account.accountId ? account.accountId : String(index));
      }}
    />
  );

  const renderStatusAction = (account: TSocialAccountShort, index: number) => {
    switch (account.labelStatus) {
      case 'waitForAdmin':
        return <LabelStatus text={'Pending Review'} />;
      case 'negotiation':
      case 'priceChanged':
        return <LabelStatus text={'Offer Submitted'} />;
      case 'waitForUser':
        return (
          <button
            className={'accounts-list__status-btn'}
            onClick={() => {
              setIsModalOpen('reviewOffer');
              setAccountId(account.accountId ?? '');
              setSocialMedia(id);
            }}
          >
            Review Offer
          </button>
        );
      default:
        return renderEditButton(account, index);
    }
  };

  // TODO: mobile and tablet styles, waiting for design
  return (
    <ul className="accounts-list">
      {accounts && accounts.map((account, index) => {
        const isChange = account.labelStatus !== 'accept';

        return (
          <li key={account.accountId ? account.accountId : `${id}-${index}`} className="accounts-list__item">
          <span
            className={`accounts-list__number ${isChange ? 'accounts-list__number--wait' : ''}`}
          >
            {index + 1}
          </span>

            <p className={'accounts-list__name'}>{account.username}</p>

            {renderStatusAction(account, index)}
          </li>
        );
      })}
    </ul>
  );
};

// 'accept' | 'decline' | 'waitForAdmin' | 'waitForUser' | 'negotiation' | 'priceChange';

export const LabelStatus = ({ text }: { text: string }) => {
  return (
    <div className="accounts-list__status">
      <img src={refreshIcon} alt="Waiting for agreement" className={'accounts-list__status-img'}/>
      <span className={'accounts-list__status-text'}>
        {text}
      </span>
    </div>
  )
};
