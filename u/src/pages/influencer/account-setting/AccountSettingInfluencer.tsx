import { useEffect } from 'react';
import { useAccountSetupStore } from '../components/account-setup-form/store/useAccountSetupStore';
import { useAccountSettingsStore } from './store/useAccountSettingsStore';
import { useInfluenserProfileStore } from '@/store/influencer/account-settings/useInfluenserProfileStore';
import { useInfluencerProfileQuery } from './hooks/useInfluencerProfileQuery';
import { useCreateSocialAccountMutation, useDeleteSocialAccountMutation, useSocialAccountQuery, useUpdateSocialAccountMutation } from './hooks/socialAccounts.hooks';

import { Breadcrumbs, Container, Loader } from "@/components";
import { AccountDetails } from './components/account-details/AccountDetails';
// import { NotificationsVia } from './components/notifications-via/NotificationsVia';
import { SocialList } from './components/social-list/SocialList';
import { AccountSetupForm } from '../components/account-setup-form/AccountSetupForm';
import { EditPasswordFlow } from './components/edit-password-flow/EditPasswordFlow';
import { normalizeAccountForApi } from '../shared/utils/socialAccount.mapper';

import './_account-setting.scss';

//TODO: all ready (need refactor edit-password-flow) and minor fixes;

export const AccountSettingInfluencer = () => {
  const { settingsMode, onResetAccountForm } = useAccountSetupStore();
  const { resetMode, mode } = useAccountSettingsStore();
  const { setProfile } = useInfluenserProfileStore();

  const {
    data: rqProfileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useInfluencerProfileQuery();

  const createMutation = useCreateSocialAccountMutation();
  const updateMutation = useUpdateSocialAccountMutation();
  const deleteMutation = useDeleteSocialAccountMutation();

  // Reset on unmount
  useEffect(() => {
    return () => {
      onResetAccountForm();
      resetMode();
    };
  }, [onResetAccountForm, resetMode]);

  // Set profile data when fetched
  useEffect(() => {
    if (rqProfileData) {
      setProfile(rqProfileData);
    }
  }, [rqProfileData, setProfile]);

  // account form mode
  const isAccountFormMode = settingsMode.type === "account";
  const platform = isAccountFormMode ? settingsMode.platform : undefined;
  const accountId = isAccountFormMode ? settingsMode.accountIdentifier : undefined;
  const isEditMode = isAccountFormMode && !!accountId;

  const {
    data: rqAccountData,
    isLoading: isAccountLoading,
    isFetching: isAccountFetching,
    isError: isAccountError,
    error: accountError,
  } = useSocialAccountQuery(platform, accountId, isEditMode);

  if (isAccountFormMode) {
    // edit mode loading/error
    if (isEditMode && (isAccountLoading || isAccountFetching)) {
      return <Loader />;
    }

    if (isEditMode && isAccountError) {
      console.error("Error fetching social account by ID:", accountError);
      return <p>Error loading account data.</p>;
    }

    const account = isEditMode ? rqAccountData : undefined;

    return (
      <AccountSetupForm
        platform={platform!}
        account={account}
        onSave={async (data) => {
          // normalize before api call
          const cleanedData = normalizeAccountForApi(data);

          try {
            if (!isEditMode) {
              console.log('Create data:', cleanedData);
              await createMutation.mutateAsync({
                platform: platform!,
                payload: cleanedData,
              });
              onResetAccountForm();
              return;
            }

            console.log('Update data:', cleanedData);
            await updateMutation.mutateAsync({
              platform: platform!,
              accountId: accountId!,
              payload: cleanedData,
            });
            onResetAccountForm();
          } catch (error) {
            console.error('Error saving social account:', error);
            // setLocal error toaster?
          }
        }}
        onRemove={async () => {
          if (!isEditMode) return;

          try {
            await deleteMutation.mutateAsync({
              accountId: accountId!,
              socialMedia: platform!,
              deleteReason: 'Account is deprecated',
            });
            onResetAccountForm();
          } catch (error) {
            console.error('Error deleting social account:', error);
            // setLocal error toaster?
          }
        }}
      />
    );
  }

  // main settings page loading/error
  if (isProfileLoading) {
    return <Loader />;
  }

  if (isProfileError) {
    console.error("Error fetching influencer profile:", profileError);
    return <p>Error loading profile data.</p>;
  }

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

              {/* <NotificationsVia /> */}

              <SocialList />
            </div>
          </>
        )}
    </Container>
  );
};

// const fetchProfileData = async () => {
//   const data = await getInfluencerProfile();
//   return data;
// };

// // Fetch and set profile data on component mount
// useEffect(() => {
//   fetchProfileData().then((data) => {
//     setProfile(data);
//   }).catch((error) => {
//     console.error('Error fetching profile data:', error);
//   });
// }, []);

// //profile after fetch
// console.log('Profile Data:', profile);

// // Handlers for creating, updating, and deleting social accounts
// //send platform to createSocialAccount?
// const handleCreateAccount = async (data: SocialAccountDraft, socialMedia: TSocialAccounts) => {
//   console.log('Data to create:', data);
//   const cleanedData = normalizeAccountForApi(data);
//   console.log('Data after normalize:', cleanedData);

//   const res = await createSocialAccount(cleanedData, socialMedia);
//   console.log('Response from createSocialAccount:', res);
//   const refrashedProfile = await getInfluencerProfile();
//   console.log('Refrashed profile after account creation:', refrashedProfile);

//   setProfile(normalizeProfileLists(refrashedProfile));
// };

// const handleUpdateAccount = async (data: SocialAccountDraft, accountId: string, platform: TSocialAccounts) => {
//   console.log('Data to update:', data, accountId, platform);
//   const cleanedData = normalizeAccountForApi(data);
//   console.log('Date after normalize:', cleanedData);
//   const res = await updateSocialAccount(cleanedData, accountId, platform);
//   console.log('Response from updateSocialAccount:', res);

//   if (!profile) return;

//   const next = updateProfilePlatformList(profile, platform, (list) =>
//     list.map((acc) => (acc.accountId === accountId ? { ...acc, username: res.username } : acc))
//   );
//   console.log('Update profile state with the updated account info:', next);

//   setProfile(next);
// };

// const handleDeleteAccount = async (accountId: string, platform: TSocialAccounts) => {
//   console.log('Data to delete:', accountId, platform);
//   if (!profile) return;

//   const prevProfile = profile;
//   setProfile(updateProfilePlatformList(profile, platform, (list) =>
//     list.filter((acc) => acc.accountId !== accountId)
//   ));

//   try {
//     await deleteSocialAccount({
//       accountId,
//       socialMedia: platform,
//       deleteReason: 'Account is deprecated',
//     });
//   } catch (error) {
//     console.error('Error deleting social account:', error);
//     // Revert profile state if deletion fails
//     setProfile(prevProfile);
//     throw error;
//   }
// };

// // const { data, isLoading } = useQuery(['influencerProfileData'], getInfluencerProfileData);

// // if (isLoading) {
// //   return <p>Loading...</p>;
// // };

// const [account, setAccount] = useState<SocialAccountDraft | undefined>(undefined);
// const [isLoading, setIsLoading] = useState(false);

// useEffect(() => {
//   if (settingsMode.type !== "account") {
//     setAccount(undefined);
//     setIsLoading(false);
//     return;
//   }

//   // create mode - no accountId
//   if (!settingsMode.accountIdentifier) {
//     setAccount(undefined);
//     setIsLoading(false);
//     return;
//   }

//   // edit mode
//   setAccount(undefined);
//   setIsLoading(true);

//   getSocialAccountById(settingsMode.platform, settingsMode.accountIdentifier)
//     .then((data) => setAccount(normalizeAccountForForm(data)))
//     .catch((error) => console.error("Error fetching social account by ID:", error))
//     .finally(() => setIsLoading(false));
// }, [settingsMode.type, settingsMode.platform, settingsMode.accountIdentifier]);

// if (settingsMode.type === 'account') {
//   if (isLoading) {
//     return <p>Loading account data...</p>;
//   }

//   return (
//     <AccountSetupForm
//       platform={settingsMode.platform}
//       account={account}
//       onSave={(data) => {
//         if (!account || !account.accountId) {
//           console.log('Create data:', data);
//           handleCreateAccount(data, settingsMode.platform);
//           return;
//         }
//         console.log('Update data:', data);
//         handleUpdateAccount(data, account.accountId, settingsMode.platform);
//       }}
//       onRemove={() => {
//         if (account && account.accountId) {
//           handleDeleteAccount(account.accountId, settingsMode.platform);
//         }
//       }}
//     />
//   );
// };