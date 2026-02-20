import { useInfluencerProfile } from "@/pages/influencer/shared/hooks/useInfluencerProfile.ts";
import { Breadcrumbs, Container, Loader } from "@/components";
import { SocialAccountsList } from "@/pages/influencer/components/social-accounts-list/SocialAccountsList.tsx";
import { AccountSetupForm } from "@/pages/influencer/components/account-setup-form/AccountSetupForm.tsx";
import { normalizeAccountForApi } from "@/pages/influencer/shared/utils/socialAccount.mapper.ts";
import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

import './_social-accounts.scss';

export const SocialAccounts = () => {
  const {
    isAccountFormMode,
    isEditMode,
    isAccountLoading,
    isAccountFetching,
    accountError,
    isAccountError,
    rqAccountData,
    platform,
    accountId,
    onResetAccountForm,
    rqProfileData,
    isProfileLoading,
    isProfileError,
    profileError,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useInfluencerProfile();

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

  // profile loading/error
  if (isProfileLoading) {
    return <Loader />;
  }

  if (isProfileError) {
    console.error("Error fetching influencer profile:", profileError);
    return <p>Error loading profile data.</p>;
  }

  console.log(rqProfileData);

  const getProfileAccounts = (platform: TSocialAccounts) => {
    if (!rqProfileData) return [];

    return rqProfileData[platform].map((account) => ({
      username: account.username,
      accountId: account.accountId,
      agreementStatus: account.agreementStatus,
    }));
  }

  return (
    <Container className="social-accounts-page">
      <Breadcrumbs />

      <div className="social-accounts-page__content">
        <div className="social-accounts-page__header">
          <h3 className="social-accounts-page__title">Social accounts</h3>
        </div>
        <SocialAccountsList getAccounts={getProfileAccounts} />
      </div>
    </Container>
  );
};