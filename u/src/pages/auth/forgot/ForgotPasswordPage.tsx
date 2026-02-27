import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/store/get-user";
import { useMutation } from "@tanstack/react-query";
import { resetPasswordApi } from "@/api/auth/auth.api.ts";
import { ButtonMain } from "@/components/ui/buttons-fix/ButtonFix.tsx";
import { Modal } from "@/components/ui/modal-fix/Modal.tsx";
import { handleApiError } from "@/api/error.api.ts";
import { BaseInput, Container, Form } from "@/components";
import { type ForgotFormData, forgotSchema } from "@/pages/auth/forgot/validation/forgot.schema.ts";

import "./_forgot_password_page.scss";

export const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
  const { role } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      setIsModalOpen(true);
    },
    onError: (error) => {
      console.error("Error resetting password:", error);
      handleApiError(error);
    },
  });

  return (
    <Container>
      <div className="forgot-password-page">
        <div className="forgot-password-page__title-block">
          <h1 className="forgot-password-page__title">Reset your password</h1>
          <p className="forgot-password-page__subtitle">
            Enter your email address below and we’ll send you a link to reset your
            password
          </p>
        </div>
        <Form<ForgotFormData>
          className={"forgot-password-page__form"}
          onSubmit={(data) => mutateAsync({email: data.email, role})}
          schema={forgotSchema}
          submitButton={ <ButtonMain type={'submit'} className={"forgot-password-page__submit-btn"} label={isPending ? "Sending..." : "Send reset link"} />}
          validateMode={"onSubmit"}
        >
          <BaseInput
            name={"email"}
            label={"Email"}
            placeholder={"Enter email"}
            type={"email"}
          />
        </Form>

        {/* Modal*/}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <div className="forgot-password-page__modal">
              <div className="forgot-password-page__modal-content">
                <div className="forgot-password-page__modal-texts">
                  <h3 className="forgot-password-page__modal-title">
                    Check your inbox
                  </h3>

                  <div className="forgot-password-page__modal-subtitle-block">
                    <p className="forgot-password-page__modal-subtitle">
                      We’ve sent you a password reset link (if an account with this
                      email exists).
                    </p>

                    <p className="forgot-password-page__modal-subtitle">
                      Please check your inbox and follow the instructions to reset
                      your password.
                    </p>
                  </div>
                </div>

                <ButtonMain
                  label="Ok"
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
