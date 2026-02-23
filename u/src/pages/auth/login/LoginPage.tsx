import { useState, type FC, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useUser } from "@/store/get-user/index.ts";
import { loginApi } from "@/api/auth/auth.api.ts";
import { handleApiError } from "@/api/error.api.ts";
import { ButtonMain } from "@/components/ui/buttons-fix/ButtonFix.tsx";
import { type LoginFormData, loginSchema } from "@/pages/auth/login/validation/login.schema.ts";
import { BaseInput, Form } from "@/components";
import { BaseMaskedPasswordInput } from "@components/ui/base-masked-password-input/BaseMaskedPasswordInput.tsx";

import "./_login-page.scss";

export const LoginPage: FC = () => {
  const { setAccessToken } = useAuth();
  const { role, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: LoginFormData = useMemo(() => {
    return {
      email: "",
      password: "",
    };
  }, []);

  const handleLogin = async (formData: LoginFormData) => {
    const { email, password } = formData;

    setIsLoading(true);
    try {
      const response = await loginApi({ email, password, role });

      if (response) {
        setUser(response);
        setAccessToken(response.accessToken);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1 className="login-page__title">
        Log in to your {role === "client" ? "Client" : "Influencer"} Dashboard
      </h1>

      <Form<LoginFormData>
        className={"login-page__form"}
        submitButton={<ButtonMain type={'submit'} className={"login-page__submit-btn"} label={isLoading ? "Logging in..." : "Log in"} />}
        onSubmit={handleLogin}
        defaultValues={defaultValues}
        schema={loginSchema}
        // validateMode={'all'}
      >
        <BaseInput
          name={"email"}
          label={"Email"}
          placeholder={"Enter email"}
          type={"email"}
        />
        <div className="login-page__password-block">
          <BaseMaskedPasswordInput
            name={"password"}
            label={"Password"}
            placeholder={"Enter password"}
          />
          <Link
            className="login-page__forgot"
            to={"/forgot-password"}
          >
            Forgot password?
          </Link>
        </div>
      </Form>


      <div className="login-page__footer">
        <p className="login-page__footer--text">
          Don’t have an account?{" "}
          <Link
            className="login-page__footer--link"
            to={role === "client" ? "/client-signup" : "/influencer-signup"}
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

// const Loader = () => {
//   return (
//     <div className="loader">
//       <svg viewBox="0 0 200 200" width="120" height="120">
//         <defs>

//           <linearGradient id="spinGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="0">
//             <stop offset="0%" stop-color="#7dd3fc" />
//             <stop offset="50%" stop-color="#c084fc" />
//             <stop offset="100%" stop-color="#7dd3fc" />
//           </linearGradient>

//           <mask id="rayMask">
//             <rect width="200" height="200" fill="black" />
//             <g transform="translate(100 100)">
//               {Array.from({ length: 120 }).map((_, i) => (
//                 <line
//                   key={i}
//                   x1="0"
//                   y1="40"
//                   x2="0"
//                   y2="100"
//                   stroke="white"
//                   strokeWidth="1.2"
//                   transform={`rotate(${(360 / 120) * i})`}
//                 />
//               ))}
//             </g>
//           </mask>
//         </defs>

//         <circle
//           cx="100"
//           cy="100"
//           r="90"
//           fill="url(#spinGradient)"
//           mask="url(#rayMask)"
//           className="spinner-gradient"
//         />
//       </svg>
//     </div>
//   );
// };
