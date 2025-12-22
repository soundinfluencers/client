import React from "react";
import { Form, SubmtiButton } from "../../../../components";
import { useAccountChange } from "../../../../store/client/account-settings";
import { ReserPasswordForm } from "../../../../components/form/client-forms/account-settings";
interface Props {}

export const ReserPassword: React.FC<Props> = () => {
  const { onChangeEmail } = useAccountChange();
  return (
    <div className="reset-password">
      <div className="Account-settings__subtitle">
        <h3>Edit password</h3>
      </div>
      <Form
        onSubmit={onChangeEmail}
        submitButton={<SubmtiButton data="Save" />}>
        <ReserPasswordForm />
      </Form>
    </div>
  );
};
