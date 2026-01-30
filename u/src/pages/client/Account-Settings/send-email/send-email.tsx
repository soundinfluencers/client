import { Form, SubmitButton } from "@/components";
import { EmailForm } from "@/pages/client/components/client-forms/account-settings";
import { useAccountChange } from "@/store/client/account-settings";

export const SendEmail = () => {
  const { setConfirm } = useAccountChange();

  return (
    <div>
      <div className="Account-settings__subtitle">
        <h3>Send a verification email to reset it</h3>
      </div>
      <Form
        onSubmit={setConfirm}
        submitButton={
          <SubmitButton className="add-style-profile" data="Send" />
        }>
        <EmailForm />
      </Form>
    </div>
  );
};
