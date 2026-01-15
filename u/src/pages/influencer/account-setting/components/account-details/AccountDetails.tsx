import './_account-details.scss';
import { EditButton } from '../../../../../components/ui/edit-button/EditButton';
import { AccountDetailsList } from './components/account-details-list/AccountDetailsList';
import type React from 'react';
import { AccountDetailsForm } from './components/account-details-form/AccountDetailsForm';
import { useAccountSettingsStore } from '../../store/useAccountSettingsStore';
import { useUserStore } from '../../../../../store/influencer/account-settings/useUserStore';

// interface Props {
//   userData: any;
// }

export const AccountDetails: React.FC = () => {
  const { mode, setMode } = useAccountSettingsStore();
  const { user } = useUserStore();

  //TODO: impl edit functionality
  return (
    <div className="account-details">
      <div className='account-details__header'>
        <h3 className='account-details__title'>Account Details</h3>
        <EditButton variants="account" onClick={() => setMode(mode === "edit-details" ? "view" : "edit-details")} className={mode === "edit-details" ? 'active' : ''} />
      </div>

      { mode === "edit-details" ? (<AccountDetailsForm  />) : (<AccountDetailsList  />) }
    </div>
  );
};

