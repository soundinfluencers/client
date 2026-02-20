import { useAccountSettingsStore } from "@/pages/influencer/account-setting/store/useAccountSettingsStore.ts";
import { useInfluencerProfile } from "@/pages/influencer/shared/hooks/useInfluencerProfile.ts";
import { AccountDetails } from "@/pages/influencer/account-setting/components/account-details/AccountDetails.tsx";
import { NotificationsVia } from "@/pages/influencer/account-setting/components/notifications-via/NotificationsVia.tsx";
import {  Loader } from "@/components";

import './_account-setting-main.scss';

export const AccountSettingMain = () => {
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
    <div className="account-setting-main">
      <AccountDetails profile={rqProfileData}/>
      {mode === "view" && <NotificationsVia notificationMethods={rqProfileData?.notificationMethods} />}
    </div>
  );
};