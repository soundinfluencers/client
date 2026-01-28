import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useInfluenserProfileStore } from "@/store/influencer/account-settings/useInfluenserProfileStore";
import { useAccountSettingsStore } from "../../../../../store/useAccountSettingsStore";
import { useUpdateInfluencerDetails } from "@/pages/influencer/account-setting/hooks/useInfluencerProfileDetails";

import { FormFields } from "../../../../../../../../components/form/render-fields/FormFields";
import { MaskedPasswordInput } from "./masked-password-input/MaskedPasswordInput";
import { ButtonMain } from "@/components/ui/buttons-fix/ButtonFix";
import { ACCOUNT_DETAILS_INPUTS_DATA } from "../data/account-details-inputs.data";
import type { InfluencerProfileApi, TInfluencerProfileDetailsModel } from "@/types/user/influencer.types";

import './_account-details-form-content.scss'

export const AccountDetailsFormContent = () => {
  const { handleSubmit } = useFormContext<TInfluencerProfileDetailsModel>();
  const { setMode } = useAccountSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useInfluenserProfileStore();

  const updateMutation = useUpdateInfluencerDetails();

  const handleSave = async (data: TInfluencerProfileDetailsModel) => {
    if (!profile) return;

    if (compareProfiles(data, profile)) {
      console.log("No changes detected, skipping update.");
      setMode("view");
      return;
    }

    console.log('Form data to save:', data);
    setIsLoading(true);
    console.log('Profie before update', profile);

    try {
      await updateMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error updating influencer profile details:", error);
      // Handle error (e.g., show toast notification)
    } finally {
      setIsLoading(false);
      setMode("view");
    }
  }

  return (
    <div className="account-details-form-content">
      <FormFields inputs={ACCOUNT_DETAILS_INPUTS_DATA} />

      <MaskedPasswordInput />

      <div className="account-details-form-content__actions">
        <ButtonMain
          label={isLoading ? "Saving..." : "Save"}
          onClick={handleSubmit(handleSave)}
          isDisabled={isLoading}
        />
      </div>
    </div>
  );
};

function compareProfiles(a: TInfluencerProfileDetailsModel, b: InfluencerProfileApi): boolean {
  return (
    a.firstName === b.firstName &&
    a.email === b.email &&
    a.phone === b.phone &&
    a.lastName === b.lastName
    // a.profilePhotoUrl === b.profilePhotoUrl &&
    // a.telegramUsername === b.telegramUsername
  );
};