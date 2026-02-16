import { useAccountSetupStore } from "@/pages/influencer/components/account-setup-form/store/useAccountSetupStore.ts";
import { useAccountSettingsStore } from "@/pages/influencer/account-setting/store/useAccountSettingsStore.ts";
import { useEffect } from "react";
import { useInfluencerProfileQuery } from "@/pages/influencer/account-setting/hooks/useInfluencerProfileQuery.ts";
import {
  useCreateSocialAccountMutation, useDeleteSocialAccountMutation, useSocialAccountQuery,
  useUpdateSocialAccountMutation,
} from "@/pages/influencer/account-setting/hooks/socialAccounts.hooks.ts";

export const useInfluencerProfile = () => {
  const { settingsMode, onResetAccountForm } = useAccountSetupStore();
  const { resetMode } = useAccountSettingsStore();

  // Reset forms state on unmount
  useEffect(() => {
    return () => {
      onResetAccountForm();
      resetMode();
    };
  }, [onResetAccountForm, resetMode]);

  // get profile data
  const {
    data: rqProfileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useInfluencerProfileQuery();

  // create mutations for social accounts
  const createMutation = useCreateSocialAccountMutation();
  const updateMutation = useUpdateSocialAccountMutation();
  const deleteMutation = useDeleteSocialAccountMutation();

  // account form mode
  const isAccountFormMode = settingsMode.type === "account";
  const platform = isAccountFormMode ? settingsMode.platform : undefined;
  const accountId = isAccountFormMode ? settingsMode.accountIdentifier : undefined;
  const isEditMode = isAccountFormMode && !!accountId;

  // get social account data if in edit mode
  const {
    data: rqAccountData,
    isLoading: isAccountLoading,
    isFetching: isAccountFetching,
    isError: isAccountError,
    error: accountError,
  } = useSocialAccountQuery(platform, accountId, isEditMode);

  return {
    // profile data
    rqProfileData,
    isProfileLoading,
    isProfileError,
    profileError,
    // social account mutations
    createMutation,
    updateMutation,
    deleteMutation,
    // account form mode
    accountId,
    platform,
    isAccountFormMode,
    isEditMode,
    onResetAccountForm,
    // social account data
    rqAccountData,
    isAccountLoading,
    isAccountFetching,
    isAccountError,
    accountError,
  };
};