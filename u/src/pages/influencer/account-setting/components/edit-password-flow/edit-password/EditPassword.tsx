import { Form } from "@/components";
import {
  EditPasswordFormContent
} from "@/pages/influencer/account-setting/components/edit-password-flow/edit-password/components/EditPasswordFormContent.tsx";

import './_edit-password.scss';
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/pages/influencer/account-setting/components/edit-password-flow/edit-password/validation/schema.ts";

export const EditPassword = () => {
  return (
    <div className="edit-password">
      <div className="edit-password__header">
        <h3 className="edit-password__title">Edit password</h3>
      </div>
      <Form<ChangePasswordValues>
        className={"edit-password__form"}
        schema={changePasswordSchema}
      >
        <EditPasswordFormContent />
      </Form>
    </div>
  );
};