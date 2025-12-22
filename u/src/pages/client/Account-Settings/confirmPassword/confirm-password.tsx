import React from "react";
import { Form, SubmtiButton } from "../../../../components/";
import { ConfirmForm } from "../../../../components/form/client-forms/account-settings";

interface Props {}

export const Confirm: React.FC<Props> = () => {
  return (
    <div className="reset-password">
      <div className="Account-settings__subtitle">
        <h3>Edit password</h3>
      </div>
      <Form submitButton={<SubmtiButton data={"Save"} />}>
        {" "}
        <ConfirmForm />
      </Form>
    </div>
  );
};
