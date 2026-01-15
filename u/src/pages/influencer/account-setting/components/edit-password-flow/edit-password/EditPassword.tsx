import { Form } from "../../../../../../components";
import { FormFields } from "../../../../../../components/form/render-fields/FormFields";
import { ButtonMain } from "../../../../../../components/ui/buttons-fix/ButtonFix";
import { useAccountSettingsStore } from "../../../store/useAccountSettingsStore";
import { EDIT_PASSWORD_FLOW_INPUTS } from "../data/inputs.data";

import './_edit-password.scss';

export const EditPassword: React.FC = () => {
  const { setMode } = useAccountSettingsStore();

  return (
    <div className="edit-password">
      <div className="edit-password__header">
        <h3 className="edit-password__title">Edit password</h3>
      </div>
      <Form
        className="edit-password__form"
        submitButton={<ButtonMain label="Save" type="submit"/>}
        onSubmit={() => setMode("send-email")}
      >
        <FormFields inputs={EDIT_PASSWORD_FLOW_INPUTS.editPassword.inputs} />
      </Form>
    </div>
  );
}