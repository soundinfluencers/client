import { type FC } from "react";
import { type NavigateFunction, useNavigate } from "react-router-dom";
import { TextInput } from "@/components/ui/inputs/text-input/TextInput.tsx";
import { useLoginStore } from "../../../store/features/loginSlice.ts";
import { ButtonMain } from "@/components/ui/buttons/button/Button.tsx";
import "./_login-page.scss";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { loginApi } from "@/api/auth/auth.api.ts";
import { useUser } from "@/store/get-user/index.ts";

export const LoginPage: FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const { role, setUser } = useUser();
  // const { setInfluencer } = useInfluencerStore();
  const { email, password, setEmail, setPassword } = useLoginStore();
  const { setAccessToken } = useAuth();

  const handleLogin = async () => {
    const response = await loginApi({
      email,
      password,
      role,
    });
    if (response) {
      setUser(response);
      setAccessToken(response.accessToken);
    }
  };

  return (
    <div className="login-page__wrapper">
      {" "}
      <div className="login-page">
        {" "}
        <p className="login-page__title">
          Log in to your {role === "client" ? "Client" : "Influencer"} Dashboard
        </p>
        <div className="login-page__inputs">
          <TextInput
            title="Email"
            isError={false}
            value={email}
            setValue={(value) => setEmail(value)}
            placeholder="Enter email"
          />
          <div className="login-page__password-block">
            <TextInput
              title="Password"
              isError={false}
              value={password}
              setValue={(value) => setPassword(value)}
              type="password"
              placeholder="Enter password"
            />
            <p
              className="login-page__forgot"
              onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </p>
          </div>
        </div>
        <div className="login-page__controls">
          <ButtonMain
            text={"Log in now"}
            onClick={handleLogin}
            isDisabled={email.length === 0 || password.length === 0}
          />
        </div>
      </div>
      <div className="login-page__footer">
        <p className="login-page__footer--text">
          Don’t have an account?{" "}
          <a
            className="login-page__footer--link"
            onClick={() => navigate("/signup/client")}>
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};
