import { useInfluencerProfile } from "@/pages/influencer/shared/hooks/useInfluencerProfile.ts";
import { Breadcrumbs, Container, Loader } from "@/components";
import { SocialAccountsList } from "@/pages/influencer/components/social-accounts-list/SocialAccountsList.tsx";
import { AccountSetupForm } from "@/pages/influencer/components/account-setup-form/AccountSetupForm.tsx";
import { normalizeAccountForApi } from "@/pages/influencer/shared/utils/socialAccount.mapper.ts";
import type { TSocialAccounts } from "@/types/user/influencer.types.ts";
import { Error } from "@/pages/influencer/shared/components/error/Error.tsx";
import { useSocialAccountStatusStore } from "@/pages/influencer/social-accounts/store/store.ts";
import { useEffect } from "react";

import {
  ReviewOfferModal
} from "@/pages/influencer/social-accounts/components/review-offer-modal/ReviewOfferModal.tsx";

import './_social-accounts.scss';


export const SocialAccounts = () => {
  const { isModalOpen, onCloseModal } = useSocialAccountStatusStore();

  useEffect(() => {
    // console.log('SocialAccounts mounted');
    return () => {
      // console.log('SocialAccounts unmounted, closing any open modals');
      onCloseModal();
    }
  }, [onCloseModal]);

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

    console.log("account:", account);

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
              // setIsModalOpen(true);
              return;
            }

            // console.log('Update data:', cleanedData);
            // console.log("New price", cleanedData.price);
            // console.log("Old price", account?.price);
            await updateMutation.mutateAsync({
              platform: platform!,
              accountId: accountId!,
              payload: cleanedData,
            });
            onResetAccountForm();
            if (cleanedData.price && cleanedData.price !== account?.price) {
              // setIsPriceModalOpen(true);
            }
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
    return <Error />;
  }

  // console.log(rqProfileData);

  const getProfileAccounts = (platform: TSocialAccounts) => {
    if (!rqProfileData) return [];

    return rqProfileData[platform].map((account) => ({
      username: account.username,
      accountId: account.accountId,
      labelStatus: account.labelStatus,
    }));
  }

  return (
    <Container className="social-accounts-page">
      <Breadcrumbs />

      <div className="social-accounts-page__content">
        <div className="social-accounts-page__header">
          <h2 className="social-accounts-page__title">Social accounts</h2>
        </div>
        <SocialAccountsList getAccounts={getProfileAccounts} />
      </div>

      {isModalOpen === 'reviewOffer' && (
        <ReviewOfferModal />
      )}
    </Container>
  );
};
