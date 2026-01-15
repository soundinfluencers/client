import { type FC } from "react";
import "./_auth-page.scss";
import { SwitchButton } from "../../../components/ui/switchers/switch-button/SwitchButton.tsx";
import {
  ButtonMain,
  ButtonSecondary,
} from "../../../components/ui/buttons/button/Button.tsx";
import { useNavigate } from "react-router-dom";
import { useLoginStore } from "../../../store/features/loginSlice.ts";

export const AuthPage: FC = () => {
  const navigate = useNavigate();
  const { role } = useLoginStore();

  const handleSignupClick = () => {
    if (role === "client") navigate("/signup/client");
    else navigate("/signup/influencer");
  };

  return (
    <div className="auth-page__wrapper">
      <div className="auth-page">
        <div className="auth-page__content">
          <div className="auth-page__title-block">
            <p className="auth-page__title">Create or access your account</p>
            <p className="auth-page__subtitle">
              Choose how you’d like to collaborate with SoundInfluencers
            </p>
          </div>

          <div className="auth-page__form-block">
            <div className="auth-page__switch">
              <SwitchButton
                firstTitle={"Client"}
                secondTitle={"Influencer"}
              />
            </div>

            <div className="auth-form">
              <div className="auth-form__header">
                <p className="auth-form__title">
                  {role === "client"
                    ? "I’m a sponsoring client"
                    : "I’m an influencer"}
                </p>
                <p className="auth-form__subtitle">
                  {role === "client"
                    ? "Discover top creators and manage your campaigns"
                    : "Join campaigns and collaborate with leading brands"}
                </p>
              </div>
              <div className="auth-form__controls">
                <ButtonSecondary
                  text={"Log In"}
                  onClick={() => navigate("/login")}
                />
                <ButtonMain text={"Sign Up"} onClick={handleSignupClick} />
              </div>
            </div>
          </div>
        </div>
        
        {/* <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <button onClick={() => navigate("/dashboard/promos/new-promos")} className="btn">new-promos</button>
          <button onClick={() => navigate("/dashboard/promos/distributing")} className="btn">distributing</button>
          <button onClick={() => navigate("/dashboard/promos/completed")} className="btn">completed</button>
          <button onClick={() => navigate("/dashboard/create-invoice")} className="btn">create-invoice</button>
          <button onClick={() => navigate("/dashboard/invoices")} className="btn">invoices</button>
          <button onClick={() => navigate("/dashboard/promos")} className="btn">promos</button>
          <button onClick={() => navigate("/dashboard/account-setting")} className="btn">account-setting</button>
        </div> */}
      </div>
      <div className="auth-page__footer">
        <p>Amplify your influence</p>
      </div>
    </div>
  );
};
