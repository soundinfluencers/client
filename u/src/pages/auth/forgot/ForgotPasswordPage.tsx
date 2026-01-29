import { useState, type FC } from "react";
import "./_forgot_password_page.scss";
import { TextInput } from "../../../components/ui/inputs/text-input/TextInput.tsx";
import { useLoginStore } from "../../../store/features/loginSlice.ts";
import { ButtonMain } from "@/components/ui/buttons-fix/ButtonFix.tsx";
import { useMutation } from "@tanstack/react-query";
import { resetPasswordApi } from "@/api/auth/auth.api.ts";

import { Modal } from "@/components/ui/modal-fix/Modal.tsx";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "@/api/error.api.ts";

export const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
  const { email, setEmail, errorEmail, setErrorEmail } = useLoginStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate, isPending } = useMutation({
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
    <div className="forgot-password-page">
      <div className="forgot-password-page__title-block">
        <p className="forgot-password-page__title">Reset your password</p>
        <p className="forgot-password-page__subtitle">
          Enter your email address below and we’ll send you a link to reset your
          password
        </p>
      </div>
      <div className="forgot-password-page__input">
        <TextInput
          value={email}
          setValue={(value) => {
            setEmail(value);
            if (errorEmail) {
              setErrorEmail("");
            }
          }}
          isError={Boolean(errorEmail)}
          placeholder="Enter email"
          title="Email"
        />
      </div>
      <div className="forgot-password-page__controls">
        <ButtonMain
          label={isPending ? "Sending..." : "Send reset link"}
          onClick={() => {
            if (!baseValidatedEmail(email)) {
              setErrorEmail("Please enter a valid email address.");
              return;
            }
            setErrorEmail("");
            mutate(email);
          }}
          isDisabled={email.length === 0 || isPending || Boolean(errorEmail)}
        />
      </div>

      {/* Modal*/}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="forgot-password-page__modal">
            <div className="forgot-password-page__modal-content">
              <div className="forgot-password-page__modal-texts">
                <p className="forgot-password-page__modal-title">
                  Check your inbox
                </p>
                <p className="forgot-password-page__modal-subtitle">
                  We’ve sent you a password reset link (if an account with this
                  email exists).
                  <br />
                  Please check your inbox and follow the instructions to reset
                  your password.
                </p>
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
  );
};

const baseValidatedEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};
