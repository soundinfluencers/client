import React from "react";
import { Edit, Form, SubmtiButton } from "../../../../components";
import { FillData } from "..";
import { AccountSettingsForm } from "../../../../components/form/client-forms/account-settings";
import { userFields } from "../../../../constants/account-settings-data";

interface Props {
  user: any;
  isEditing: boolean;
  toggleEdit: () => void;
}

export const AccountDetailsSection: React.FC<Props> = ({
  user,
  isEditing,
  toggleEdit,
}) => {
  return (
    <div className="Account-settings__details">
      <div className="Account-settings__subtitle">
        <h3>Account details</h3>
        <Edit active={isEditing} onChange={toggleEdit} />
      </div>
      {isEditing ? (
        <Form submitButton={<SubmtiButton data="Save" />}>
          <AccountSettingsForm data={user} />
        </Form>
      ) : (
        <FillData data={user} fields={userFields} />
      )}
    </div>
  );
};
