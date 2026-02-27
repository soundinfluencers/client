import { useAccountSetupStore } from '../../account-setup-form/store/useAccountSetupStore';
import { EditButton } from '@components/ui/edit-button/EditButton.tsx';
import type { TSocialAccounts, TSocialAccountShort } from '@/types/user/influencer.types.ts';
import refreshIcon from '@/assets/icons/refresh-ccw.svg';

import './_accounts-list.scss';

interface Props {
  id: TSocialAccounts;
  accounts: TSocialAccountShort[];
}

export const AccountsList: React.FC<Props> = ({ id, accounts }) => {
  const { onEditAccount } = useAccountSetupStore();

  console.log(accounts);

  return (
    <ul className="accounts-list">
      {accounts && accounts.map((account, index) => (
        <li key={account.accountId ? account.accountId : `${id}-${index}`} className="accounts-list__item">
          <div className="accounts-list__info">
            <span className={`accounts-list__number ${account.agreementStatus === 'wait' ? 'accounts-list__number--wait' : ''}`}>{index + 1}</span>
            <p>{account.username}</p>
          </div>

          {account.agreementStatus === 'wait' ? (
            <div className="accounts-list__status">
              <img src={refreshIcon} alt="Waiting for agreement" className={'accounts-list__status-img'}/>
              <span className={'accounts-list__status-text'}>Under Approval</span>
            </div>
          ) : (
            <EditButton variants="social" onClick={() => {
              onEditAccount(id, account.accountId ? account.accountId : String(index));
            }} />
          )}
        </li>
      ))}
    </ul>
  );
}