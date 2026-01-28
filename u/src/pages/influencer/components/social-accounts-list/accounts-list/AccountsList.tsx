import { useAccountSetupStore } from '../../account-setup-form/store/useAccountSetupStore';
import { EditButton } from '../../../../../components/ui/edit-button/EditButton';
import type { TSocialAccounts, TSocialAccountShort } from '../../../../../types/user/influencer.types';

import './_accounts-list.scss';

interface Props {
  id: TSocialAccounts;
  accounts: TSocialAccountShort[];
}

export const AccountsList: React.FC<Props> = ({ id, accounts }) => {
  const { onEditAccount } = useAccountSetupStore();

  return (
    <ul className="accounts-list">
      {accounts && accounts.map((account, index) => (
        <li key={account.accountId ? account.accountId : `${id}-${index}`} className="accounts-list__item">
          <div className="accounts-list__info">
            <span>{index + 1}</span>
            <p>{account.username}</p>
          </div>
          <EditButton variants="social" onClick={() => {
            onEditAccount(id, account.accountId ? account.accountId : String(index));
          }} />
        </li>
      ))}
    </ul>
  );
}