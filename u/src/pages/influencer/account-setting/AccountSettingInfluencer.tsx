import './_account-setting.scss';

import { Breadcrumbs, Container } from "../../../components";
import { AccountDetails } from './components/account-details/AccountDetails';
import { NotificationsVia } from './components/notifications-via/NotificationsVia';
import { SocialList } from './components/social-list/SocialList';
import { AccountSetupForm } from '../components/account-setup-form/AccountSetupForm';
import { useEffect, useState } from 'react';
import { EditPasswordFlow } from './components/edit-password-flow/EditPasswordFlow';
import { useUserStore } from '../../../store/influencer/account-settings/useUserStore';
import { useAccountSetupStore } from '../components/account-setup-form/store/useAccountSetupStore';
import { useAccountSettingsStore } from './store/useAccountSettingsStore';
import { getInfluencerProfileData } from '../../../api/influencer/profile/influencer-profile.api';
import { useQuery } from '@tanstack/react-query';

//TODO: all ready (need refactor edit-password-flow) and minor fix buttons submit, connect api;

export const AccountSettingInfluencer = () => {
  const { settingsMode, onResetAccountForm } = useAccountSetupStore();
  const { resetMode, mode } = useAccountSettingsStore();
  const { saveAccount, removeAccount } = useUserStore();

  // Reset account form when navigating away from AccountSetupForm on components unmount
  useEffect(() => {
    return () => {
      if (settingsMode.type === 'account') {
        onResetAccountForm();
      }
      resetMode();
    };
  }, []);

  // const { data, isLoading } = useQuery(['influencerProfileData'], getInfluencerProfileData);

  // const [data, setData] = useState<any>(null);

  // const fetchApiData = async () => {
  //   // Simulate API call
  //   const apiData = await getInfluencerProfileData();

  //   setData(apiData);
  // }

  // useEffect(() => {
  //   fetchApiData();
  // }, []);

  // console.log(data['instagram']);

  console.log('redner');

  // if (isLoading) {
  //   return <p>Loading...</p>;
  // };

  if (settingsMode.type === 'account') {
    return (
      <AccountSetupForm
        platform={settingsMode.platform}
        mode={settingsMode.mode}
        account={settingsMode.account}
        // accountId={settingsMode.accountId}
        onSave={(data) => saveAccount(settingsMode.platform, data)}
        onRemove={() => {
          if (settingsMode.account && settingsMode.account.accountId !== undefined) {
            removeAccount(settingsMode.platform, settingsMode.account.accountId);
          }
        }}
      />
    );
  };

  return (
    <Container className="account-setting-page">
      <Breadcrumbs />

      {mode === "edit-password" ?
        (
          <EditPasswordFlow />
        ) : (
          <>
            <h2 className='account-setting-page__title'>Account settings</h2>

            <div className="account-setting-page__content">
              <AccountDetails />

              <NotificationsVia />

              <SocialList  />
            </div>
          </>
        )}
    </Container>
  );
};