import { Form } from "../../../../../../components";
import { FormFields } from "../../../../../../components/form/render-fields/FormFields";
import { ButtonMain } from "../../../../../../components/ui/buttons-fix/ButtonFix";
import { useAccountSettingsStore } from "../../../store/useAccountSettingsStore";

import { EDIT_PASSWORD_FLOW_INPUTS } from "../data/inputs.data";
import './_new-password.scss'

export const NewPassword: React.FC = () => {
  const { resetMode } = useAccountSettingsStore();

  return (
    <div className="new-password">
      <div className="new-password__header">
        <h3 className="new-password__title">New Password</h3>
      </div>
      <Form
        className="new-password__form"
        onSubmit={() => resetMode()}
        submitButton={<ButtonMain label="Send" type="submit" />}
      >
        <FormFields inputs={EDIT_PASSWORD_FLOW_INPUTS.newPassword.inputs} />
      </Form>
    </div>
  );
}