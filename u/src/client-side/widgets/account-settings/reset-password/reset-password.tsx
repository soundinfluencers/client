import { ReserPasswordForm } from "@/client-side/client-forms";
import { Form, SubmitButton } from "@/components";

import { useAccountChange } from "@/store/client/account-settings";

export const ReserPassword = () => {
  const { onChangeEmail } = useAccountChange();
  return (
    <div className="reset-password">
      <div className="Account-settings__subtitle">
        <h3>Edit password</h3>
      </div>
      <Form
        onSubmit={onChangeEmail}
        submitButton={
          <SubmitButton className="add-style-profile" data="Save" />
        }>
        <ReserPasswordForm />
      </Form>
    </div>
  );
};
