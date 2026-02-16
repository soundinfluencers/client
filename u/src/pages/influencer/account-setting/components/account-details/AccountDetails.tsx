import type React from 'react';
import { useAccountSettingsStore } from '../../store/useAccountSettingsStore';
import { EditButton } from '@components/ui/edit-button/EditButton.tsx';
import { AccountDetailsList } from './components/account-details-list/AccountDetailsList';
import { AccountDetailsForm } from './components/account-details-form/AccountDetailsForm';

import './_account-details.scss';
import type { InfluencerProfileApi } from "@/types/user/influencer.types.ts";

interface Props {
  profile: InfluencerProfileApi | undefined;
}

export const AccountDetails: React.FC<Props> = ({ profile }) => {
  const { mode, setMode } = useAccountSettingsStore();

  return (
    <div className="account-details">
      <div className="account-details__header">
        <h2 className="account-details__title">Account settings</h2>
        <EditButton
          className={mode === "edit-details" ? 'active' : ''}
          variants="account"
          onClick={() => setMode(mode === "edit-details" ? "view" : "edit-details")}
        />
      </div>

      {mode === "edit-details" ? (<AccountDetailsForm profile={profile} />) : (<AccountDetailsList profile={profile} />)}
    </div>
  );
};

