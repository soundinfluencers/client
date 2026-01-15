import { useAccountSetupStore } from '../../account-setup-form/store/useAccountSetupStore';
import { EditButton } from '../../../../../components/ui/edit-button/EditButton';
import type { TSocialAccounts } from '../../account-setup-form/types/account-setup.types';

import './_accounts-list.scss';
import type { ISignupInfluencerDraft } from '../../../../../types/user/influencer.types';

interface Props {
  id: TSocialAccounts;
  user: ISignupInfluencerDraft;
}

//TODO: fix types any where possible
export const AccountsList: React.FC<Props> = ({ id, user }) => {
  const { onEditAccount } = useAccountSetupStore();

  return (
    <ul className="accounts-list">
      {user[id].map((account, index) => (
        <li key={`${id}-${index}`} className="accounts-list__item">
          <div className="accounts-list__info">
            <span>{index + 1}</span>
            <p>{account.username}</p>
          </div>
          <EditButton variants="social" onClick={() => onEditAccount(id, account, index)} />
        </li>
      ))}
    </ul>
  );
}