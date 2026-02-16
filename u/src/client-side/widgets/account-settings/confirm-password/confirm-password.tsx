import { ConfirmForm } from "@/client-side/client-forms";
import { Form, SubmitButton } from "@/components/";

export const Confirm = () => {
  return (
    <div className="reset-password">
      <div className="Account-settings__subtitle">
        <h3>Edit password</h3>
      </div>
      <Form
        submitButton={
          <SubmitButton className="add-style-profile" data={"Save"} />
        }>
        {" "}
        <ConfirmForm />
      </Form>
    </div>
  );
};
