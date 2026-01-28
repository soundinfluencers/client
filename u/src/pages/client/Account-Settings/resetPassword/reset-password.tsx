import { Form, SubmtiButton } from "@/components";
import { ReserPasswordForm } from "@/pages/client/components/client-forms/account-settings";
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
          <SubmtiButton className="add-style-profile" data="Save" />
        }>
        <ReserPasswordForm />
      </Form>
    </div>
  );
};
