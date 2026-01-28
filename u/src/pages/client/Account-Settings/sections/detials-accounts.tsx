import React from "react";
import { Edit, Form, SubmtiButton } from "@/components";
import { FillData } from "..";
import { AccountSettingsForm } from "@/pages/client/components/client-forms/account-settings";
import { userFields } from "@/constants/client/account-settings-data";
import { updateProfile } from "@/api/client/patch-actions/updateProfile";

interface Props {
  profile: any;
  isEditing: boolean;
  toggleEdit: () => void;
}

export const AccountDetailsSection: React.FC<Props> = ({
  profile,
  isEditing,
  toggleEdit,
}) => {
  const defaults = React.useMemo(
    () => ({
      firstName: profile?.firstName ?? "",
      company: profile?.companyName ?? "",
      phone: profile?.phone ?? "",
      email: profile?.email ?? "",
    }),
    [profile?.firstName, profile.companyName, profile.phone, profile.email],
  );

  const onSubmit = async (formData: any) => {
    console.log(formData, "lyushis");
    const payload = {
      firstName: formData.firstName, // ✅ маппинг
      company: formData.company,
      phone: formData.phone,
      email: formData.email,
    };

    try {
      const res = await updateProfile(payload);
      console.log("updated ✅", res);
    } catch (e) {
      console.error("update failed ❌", e);
    }
  };
  return (
    <div className="Account-settings__details">
      <div className="Account-settings__subtitle">
        <h3>Account details</h3>
        <Edit active={isEditing} onChange={toggleEdit} />
      </div>
      {isEditing ? (
        <Form
          onSubmit={onSubmit}
          defaultValues={defaults}
          submitButton={
            <SubmtiButton className="add-style-profile" data="Save" />
          }>
          <AccountSettingsForm data={profile} />
        </Form>
      ) : (
        <FillData data={profile} fields={userFields} />
      )}
    </div>
  );
};
