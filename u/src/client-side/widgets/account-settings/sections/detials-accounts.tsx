import React from "react";
import { Edit, Form, SubmitButton } from "@/components";

import { userFields } from "@/client-side/constants/account-settings-data";

import { FillData } from "../fill-data/fill-data";
import {
  accountSettingsSchema,
  type AccountSettingsValues,
} from "@/client-side/schemas";
import { useUpdateProfileMutation } from "@/client-side/react-query";
import { AccountSettingsForm } from "@/client-side/client-forms";

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
  console.log(profile, "w");
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
