import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
// import { useInfluencerProfileStore } from "@/store/influencer/account-settings/useInfluencerProfileStore.ts";
import { useAccountSettingsStore } from "../../../../../store/useAccountSettingsStore";
import { useUpdateInfluencerDetails } from "@/pages/influencer/account-setting/hooks/useInfluencerProfileDetails";

// import { FormFields } from "@components/form/render-fields/FormFields.tsx";
import { MaskedPasswordInput } from "./masked-password-input/MaskedPasswordInput";
import { ButtonMain } from "@/components/ui/buttons-fix/ButtonFix";
// import ACCOUNT_DETAILS_INPUTS_DATA from "../data/account-details-inputs.data";
import type {
  InfluencerProfileApi,
  TInfluencerProfileDetailsModel,
} from "@/types/user/influencer.types";

import './_account-details-form-content.scss'
import { BaseInput, ImageUpload } from "@/components";

interface Props {
  profile: InfluencerProfileApi | undefined;
}

export const AccountDetailsFormContent: React.FC<Props> = ({ profile }) => {
  const { handleSubmit } = useFormContext<TInfluencerProfileDetailsModel>();
  const { setMode } = useAccountSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  const updateMutation = useUpdateInfluencerDetails();

  const handleSave = async (data: TInfluencerProfileDetailsModel) => {
    if (!profile) return;

    // console.log("Form data on submit:", data);

    if (compareProfiles(data, profile)) {
      // console.log("No changes detected, skipping update.");
      setMode("view");
      return;
    }

    // console.log('Form data to save:', data);
    setIsLoading(true);
    // console.log('Profile before update', profile);

    try {
      await updateMutation.mutateAsync(data);
    } catch (error) {
      console.log("Error updating influencer profile details:", error);
      // Handle error (e.g., show toast notification)
    } finally {
      setIsLoading(false);
      setMode("view");
    }
  }

  return (
    <>
      <div className="account-details-form-content">
        <BaseInput
          name={"firstName"}
          label={"First Name"}
          placeholder={"Enter first name"}
          type={"text"}
        />
        <BaseInput
          name={"lastName"}
          label={"Last Name"}
          placeholder={"Enter last name"}
          type={"text"}
        />
        <ImageUpload
          name={"logoUrl"}
          label={"Photo profile"}
          placeholder={"Attach the logo for your brand here"}
          size={"small"}
        />
        <BaseInput
          name={"phone"}
          label={"Phone number"}
          placeholder={"Enter phone number"}
          type={"text"}
        />
        <BaseInput
          name={"email"}
          label={"Email"}
          placeholder={"Enter email"}
          type={"email"}
        />
        <MaskedPasswordInput/>
      </div>

      <div className="account-details-form-content__submit">
        <ButtonMain
          label={isLoading ? "Saving..." : "Save"}
          onClick={handleSubmit(handleSave)}
          isDisabled={isLoading}
        />
      </div>
    </>
  );
};

function compareProfiles(a: TInfluencerProfileDetailsModel, b: InfluencerProfileApi): boolean {
  return (
    a.firstName === b.firstName &&
    a.email === b.email &&
    a.phone === b.phone &&
    a.lastName === b.lastName &&
    a.logoUrl === b.logoUrl
    // a.telegramUsername === b.telegramUsername
  );
}