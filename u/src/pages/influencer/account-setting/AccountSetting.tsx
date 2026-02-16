import { useAccountSettingsStore } from './store/useAccountSettingsStore';
import { useInfluencerProfile } from "@/pages/influencer/shared/hooks/useInfluencerProfile.ts";

import { Breadcrumbs, Container, Loader } from "@/components";
import { AccountDetails } from './components/account-details/AccountDetails';
import { NotificationsVia } from './components/notifications-via/NotificationsVia';
import { EditPasswordFlow } from './components/edit-password-flow/EditPasswordFlow';

import './_account-setting.scss';

//TODO: all ready (need refactor edit-password-flow) and minor fixes;

export const AccountSetting = () => {
  const { mode } = useAccountSettingsStore();
  const { isProfileLoading, isProfileError, profileError, rqProfileData } = useInfluencerProfile();

  // account settings page loading/error
  if (isProfileLoading) {
    return <Loader/>;
  }

  if (isProfileError) {
    console.error("Error fetching influencer profile:", profileError);
    return <p>Error loading profile data.</p>;
  }

  return (
    <Container className="account-setting-page">
      <Breadcrumbs/>

      {mode === "edit-password" ?
        (
          <EditPasswordFlow/>
        ) : (
          <div className="account-setting-page__content">
            <AccountDetails profile={rqProfileData}/>
            {mode === "view" && <NotificationsVia/>}
          </div>
        )}
    </Container>
  );
};