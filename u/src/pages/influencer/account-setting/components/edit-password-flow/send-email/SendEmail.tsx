import { Form } from "../../../../../../components";
import { FormFields } from "../../../../../../components/form/render-fields/FormFields";
import { ButtonMain } from "../../../../../../components/ui/buttons-fix/ButtonFix";
import { useAccountSettingsStore } from "../../../store/useAccountSettingsStore";
import { EDIT_PASSWORD_FLOW_INPUTS } from "../data/inputs.data";
import './_send-email.scss';

export const SendEmail: React.FC = () => {
  const {setMode} = useAccountSettingsStore();

  return (
    <div className="send-email">
      <div className="send-email__header">
        <h3 className="send-email__title">Send Email</h3>
      </div>
      <Form
        className="send-email__form"
        onSubmit={() => setMode("new-password")}
        submitButton={<ButtonMain label="Send" type="submit" />}
      >
        {<FormFields inputs={EDIT_PASSWORD_FLOW_INPUTS.sendEmail.inputs} />}
      </Form>
    </div>
  );
}