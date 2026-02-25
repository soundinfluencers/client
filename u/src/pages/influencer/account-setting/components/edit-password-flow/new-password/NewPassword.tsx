import { Form } from "../../../../../../components";
import { FormFields } from "../../../../../../components/form/render-fields/FormFields";
import { ButtonMain } from "../../../../../../components/ui/buttons-fix/ButtonFix";
import { useAccountSettingsStore } from "../../../store/useAccountSettingsStore";

import { EDIT_PASSWORD_FLOW_INPUTS } from "../data/inputs.data";
import './_new-password.scss'
import { useParams, useSearchParams } from "react-router-dom";

import $api from "@/api/api.ts";

export const NewPassword: React.FC = () => {
  const { resetMode } = useAccountSettingsStore();

  const { token } = useParams();

  console.log("reset token from url:", token);

  const handleSubmit = async () => {
    $api.patch('/forgot', { token, newPassword: "newpassword123" })
    .then(response => {
      console.log("Password reset successful:", response.data);
      // resetMode();
    })
    .catch(error => {
      console.error("Error resetting password:", error);
    });
  };

  return (
    <div className="new-password">
      <div className="new-password__header">
        <h3 className="new-password__title">New Password</h3>
      </div>
      <Form
        className="new-password__form"
        onSubmit={() => resetMode()}
        submitButton={<ButtonMain label="Send" type="submit"/>}
      >
        <FormFields inputs={EDIT_PASSWORD_FLOW_INPUTS.newPassword.inputs}/>
      </Form>

      <button
        onClick={handleSubmit}
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Test API Call
      </button>
    </div>
  );
};
