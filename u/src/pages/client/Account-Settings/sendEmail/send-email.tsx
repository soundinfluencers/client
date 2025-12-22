import React from "react";
import { Form, SubmtiButton } from "../../../../components";
import { EmailForm } from "../../../../components/form/client-forms/account-settings";
import { useAccountChange } from "../../../../store/client/account-settings";

interface Props {}

export const SendEmail: React.FC<Props> = () => {
  const { setConfirm } = useAccountChange();

  return (
    <div>
      <div className="Account-settings__subtitle">
        <h3>Send a verification email to reset it</h3>
      </div>
      <Form onSubmit={setConfirm} submitButton={<SubmtiButton data="Send" />}>
        <EmailForm />
      </Form>
    </div>
  );
};
