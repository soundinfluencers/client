import type React from 'react';
import { useAccountSettingsStore } from '../../store/useAccountSettingsStore';
import { EditButton } from '../../../../../components/ui/edit-button/EditButton';
import { AccountDetailsList } from './components/account-details-list/AccountDetailsList';
import { AccountDetailsForm } from './components/account-details-form/AccountDetailsForm';

import './_account-details.scss';

export const AccountDetails: React.FC = () => {
  const { mode, setMode } = useAccountSettingsStore();

  return (
    <div className="account-details">
      <div className='account-details__header'>
        <h3 className='account-details__title'>Account Details</h3>
        <EditButton
          className={mode === "edit-details" ? 'active' : ''}
          variants="account"
          onClick={() => setMode(mode === "edit-details" ? "view" : "edit-details")}
        />
      </div>

      { mode === "edit-details" ? (<AccountDetailsForm />) : (<AccountDetailsList />) }
    </div>
  );
};

