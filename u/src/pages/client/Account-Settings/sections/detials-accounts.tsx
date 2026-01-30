import React from "react";
import { Edit, Form, SubmitButton } from "@/components";

import { AccountSettingsForm } from "@/pages/client/components/client-forms/account-settings";
import { userFields } from "@/constants/client/account-settings-data";

import {
  accountSettingsSchema,
  type AccountSettingsValues,
} from "../../components/client-forms/schemas/schema-account-settings";
import { useUpdateProfileMutation } from "../hooks/use-update-profile-mutation";
import { FillData } from "../fill-data/fill-data";

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
  const { mutateAsync } = useUpdateProfileMutation();
  const defaults = React.useMemo(
    () => ({
      firstName: profile?.firstName ?? "",
      company: profile?.companyName ?? "",
      phone: profile?.phone ?? "",
      email: profile?.email ?? "",
      password: "",
    }),
    [profile?.firstName, profile?.companyName, profile?.phone, profile?.email],
  );

  const onSubmit = async (formData: any) => {
    console.log(formData, "wad");
    const payload = {
      firstName: formData.firstName,
      company: formData.company,
      phone: formData.phone,
      email: formData.email,
    };

    await mutateAsync(payload);
    toggleEdit();
  };
  return (
    <div className="Account-settings__details">
      <div className="Account-settings__subtitle">
        <h3>Account details</h3>
        <Edit active={isEditing} onChange={toggleEdit} />
      </div>
      {isEditing ? (
        <Form<AccountSettingsValues>
          schema={accountSettingsSchema}
          defaultValues={defaults}
          onSubmit={onSubmit}
          submitButton={
            <SubmitButton className="add-style-profile" data="Save" />
          }>
          <AccountSettingsForm data={profile} />
        </Form>
      ) : (
        <FillData data={profile} fields={userFields} />
      )}
    </div>
  );
};
