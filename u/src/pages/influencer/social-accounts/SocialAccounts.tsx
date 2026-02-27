import { useInfluencerProfile } from "@/pages/influencer/shared/hooks/useInfluencerProfile.ts";
import { Breadcrumbs, Container, Loader } from "@/components";
import { SocialAccountsList } from "@/pages/influencer/components/social-accounts-list/SocialAccountsList.tsx";
import { AccountSetupForm } from "@/pages/influencer/components/account-setup-form/AccountSetupForm.tsx";
import { normalizeAccountForApi } from "@/pages/influencer/shared/utils/socialAccount.mapper.ts";
import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

import { Error } from "@/pages/influencer/shared/components/error/Error.tsx";
import { useState } from "react";
import { Modal } from "@components/ui/modal-fix/Modal.tsx";
import successImg from '@/assets/icons/success-icon.svg';

import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import './_social-accounts.scss';

export const SocialAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

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
              setIsModalOpen(true);
              return;
            }

            console.log('Update data:', cleanedData);
            console.log("New price", cleanedData.price);
            console.log("Old price", account?.price);
            await updateMutation.mutateAsync({
              platform: platform!,
              accountId: accountId!,
              payload: cleanedData,
            });
            onResetAccountForm();
            if (cleanedData.price && cleanedData.price !== account?.price) {
              setIsPriceModalOpen(true);
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
      verifiedStatus: account.verifiedStatus,
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

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
        >
          <div className="social-accounts-page__modal-content">
            <img
              src={successImg}
              alt="Success"
              className="social-accounts-page__modal-content-icon"
            />

            <div className={'social-accounts-page__modal-content-title-wrapper'}>
              <h3 className="social-accounts-page__modal-content-title">Application under review</h3>
              <div className={'social-accounts-page__modal-content-subtitle-wrapper'}>
                <p className={'social-accounts-page__modal-content-subtitle'}>Thank you for submitting your details - our team will review your application shortly</p>
                <p className={"social-accounts-page__modal-content-text"}>If your application meets our criteria, we’ll get in touch with you promptly.</p>
              </div>
            </div>

            <ButtonMain
              label={"Ok"}
              onClick={() => setIsModalOpen(false)}
              className={"social-accounts-page__modal-content-button"}
            />
          </div>
        </Modal>
      )}

      {isPriceModalOpen && (
        <Modal
          onClose={() => setIsPriceModalOpen(false)}
        >
          <div className="social-accounts-page__modal-content">
            <img
              src={successImg}
              alt="Success"
              className="social-accounts-page__modal-content-icon"
            />

            <div className={'social-accounts-page__modal-content-title-wrapper'}>
              <h3 className="social-accounts-page__modal-content-title">Price change submitted</h3>
              <div className={'social-accounts-page__modal-content-subtitle-wrapper'}>
                <p className={'social-accounts-page__modal-content-subtitle'}>Your new price has been recorded and is now under review.</p>
                <p className={"social-accounts-page__modal-content-text"}>We’ll notify you as soon as it’s approved.</p>
              </div>
            </div>

            <ButtonMain
              label={"Ok"}
              onClick={() => {

                console.log('Price change acknowledged');
                setIsPriceModalOpen(false)
              }}
              className={"social-accounts-page__modal-content-button"}
            />
          </div>
        </Modal>
      )}
    </Container>
  );
};
