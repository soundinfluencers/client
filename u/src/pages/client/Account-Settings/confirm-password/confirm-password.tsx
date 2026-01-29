import { Form, SubmtiButton } from "@/components/";
import { ConfirmForm } from "../../components/client-forms/account-settings";

export const Confirm = () => {
  return (
    <div className="reset-password">
      <div className="Account-settings__subtitle">
        <h3>Edit password</h3>
      </div>
      <Form
        submitButton={
          <SubmtiButton className="add-style-profile" data={"Save"} />
        }>
        {" "}
        <ConfirmForm />
      </Form>
    </div>
  );
};
