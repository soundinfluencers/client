import { Container, Form } from "@/components";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";

import { useNavigate, useParams } from "react-router-dom";

import './_new-password.scss'

import { BaseMaskedPasswordInput } from "@components/ui/base-masked-password-input/BaseMaskedPasswordInput.tsx";
import { useMutation } from "@tanstack/react-query";
import { resetPasswordWithTokenApi } from "@/api/auth/auth.api.ts";
import { handleApiError } from "@/api/error.api.ts";
import { useState } from "react";
import { Modal } from "@components/ui/modal-fix/Modal.tsx";
import {
  type NewPasswordFormData,
  newPasswordSchema,
} from "@/pages/auth/new-password/validation/newPassword.schema.ts";

export const NewPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("reset token from url:", token);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: resetPasswordWithTokenApi,
    onSuccess: () => {
      console.log("Password reset successful");
      setIsModalOpen(true);
    },
    onError: handleApiError,
  })

  return (
    <Container>
      <div className="new-password">
        <div className="new-password__header">
          <h3 className="new-password__title">Create new password</h3>
        </div>
        <Form<NewPasswordFormData>
          className="new-password__form"
          onSubmit={(data) => mutateAsync({token, newPassword: data.newPassword })}
          submitButton={<ButtonMain label={isPending ? 'Sending...' : "Send"} type="submit" className={"new-password__submit-btn"}/>}
          validateMode={'all'}
          schema={newPasswordSchema}
        >
          <BaseMaskedPasswordInput
            name={'newPassword'}
            label={'New password'}
            placeholder={'Enter new password'}
          />
          <BaseMaskedPasswordInput
            name={'confirmNewPassword'}
            label={'Confirm new password'}
            placeholder={'Confirm new password'}
          />
        </Form>

        {isModalOpen && (
          <Modal
            isShowCloseButton={false}
            isCloseOnClickOutsideDisabled={true}
          >
            <div className={'new-password__modal'}>
              <div className={'new-password__modal-content'}>
                <div className="new-password__modal-texts">
                  <h3 className="new-password__modal-title">
                    Password updated successfully
                  </h3>

                  <div className={'new-password__modal-subtitle-block'}>
                    <p className="new-password__modal-subtitle">
                      Your new password has been saved.
                    </p>

                    <p className="new-password__modal-subtitle">
                      You can now log in using your updated credentials.
                    </p>
                  </div>
                </div>

                <ButtonMain
                  label="Back to login"
                  onClick={() => navigate("/auth/login")}
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Container>
  );
};
