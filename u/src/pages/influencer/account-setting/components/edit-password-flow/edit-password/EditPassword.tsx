import { TextInput } from "@/components/ui/inputs/text-input/TextInput";
// import { Form } from "../../../../../../components";
// import { FormFields } from "../../../../../../components/form/render-fields/FormFields";
import { ButtonMain } from "../../../../../../components/ui/buttons-fix/ButtonFix";
import { useAccountSettingsStore } from "../../../store/useAccountSettingsStore";
// import { EDIT_PASSWORD_FLOW_INPUTS } from "../data/inputs.data";

import './_edit-password.scss';
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updatePasswordApi } from "@/api/auth/auth.api";
import { toast } from "react-toastify";

export const EditPassword: React.FC = () => {
  const { setMode } = useAccountSettingsStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  //create simple validation for new password and confirm new password
  const isValid = newPassword === confirmNewPassword && newPassword.length > 0;
  //create simple error for inputs
  const isError = confirmNewPassword.length > 0 && newPassword !== confirmNewPassword;

  const {mutate, isPending} = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => updatePasswordApi(currentPassword, newPassword),

    onSuccess: () => {
      toast.success("Password updated successfully!");
      setMode("view");
    },
  });

  return (
    <div className="edit-password">
      <div className="edit-password__header">
        <h3 className="edit-password__title">Edit password</h3>
      </div>
      <TextInput
        title="Current password"
        placeholder="Enter current password"
        type="password"
        value={currentPassword}
        setValue={(value) => setCurrentPassword(value)}
      />
      <TextInput
        title="New password"
        placeholder="Enter new password"
        type="password"
        value={newPassword}
        setValue={(value) => setNewPassword(value)}
        isError={isError}
      />
      <TextInput
        title="Confirm new password"
        placeholder="Confirm new password"
        type="password"
        value={confirmNewPassword}
        setValue={(value) => setConfirmNewPassword(value)}
        isError={isError}
      />
      <div className="edit-password__form-submit">
        <ButtonMain
          type="submit"
          label={isPending ? 'Submitting...' : 'Submit'}
          isDisabled={!isValid}
          onClick={() => {
            mutate({ currentPassword, newPassword });
          }}
        />
      </div>
    </div>
  );
}

{/* <Form
        className="edit-password__form"
        onSubmit={handleSubmit}
      >
        <FormFields inputs={EDIT_PASSWORD_FLOW_INPUTS.editPassword.inputs} />


      </Form> */}