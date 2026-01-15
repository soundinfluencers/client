import { useFormContext } from "react-hook-form";
import { FormFields } from "../../../../../../../../components/form/render-fields/FormFields";
import { ACCOUNT_DETAILS_INPUTS_DATA } from "../data/account-details-inputs.data";
import { useUserStore } from "../../../../../../../../store/influencer/account-settings/useUserStore";
import { useState } from "react";

import { MaskedPasswordInput } from "./masked-password-input/MaskedPasswordInput";
import { useAccountSettingsStore } from "../../../../../store/useAccountSettingsStore";

//TODO: fix types any where possible, change button to UButton

export const AccountDetailsFormContent = () => {
  const { handleSubmit } = useFormContext();
  const { saveUserDetails } = useUserStore();
  const { setMode } = useAccountSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (data: any) => {
    console.log('Form data to save:', data);

    setIsLoading(true);
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    saveUserDetails(data);
    setIsLoading(false);
    setMode("view");
  }

  return (
    <>
      <FormFields inputs={ACCOUNT_DETAILS_INPUTS_DATA} />

      <MaskedPasswordInput />

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 32, width: '100%', justifyContent: 'space-between' }}>
        <button
          style={{ width: 250, height: 50, background: '#00FF00', borderRadius: 8 }}
          onClick={handleSubmit(handleSave)}
          type='submit'
        >
          {isLoading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </>
  );
};