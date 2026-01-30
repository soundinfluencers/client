import { useState, type FC } from "react";
import { type NavigateFunction, useNavigate } from "react-router-dom";
import { TextInput } from "@/components/ui/inputs/text-input/TextInput.tsx";
import { useLoginStore } from "../../../store/features/loginSlice.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { loginApi } from "@/api/auth/auth.api.ts";
import { useUser } from "@/store/get-user/index.ts";
import { handleApiError } from "@/api/error.api.ts";
import { ButtonMain } from "@/components/ui/buttons-fix/ButtonFix.tsx";
import "./_login-page.scss";

export const LoginPage: FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const { role, setUser } = useUser();
  const { email, password, setEmail, setPassword } = useLoginStore();
  const { setAccessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // setIsLoading(true);
    const response = await loginApi({
      email,
      password,
      role,
    });

    if (response) {
      setUser(response);
      setAccessToken(response.accessToken);
    }
    // setIsLoading(false);
    // try {

    // } catch (error) {
    //   console.log(error);
    //   handleApiError(error);
    // } finally {
    // }
  };

  return (
    <div className="login-page__wrapper">
      <p className="login-page__title">
        Log in to your {role === "client" ? "Client" : "Influencer"} Dashboard
      </p>
      <div className="login-page">
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
            label={isLoading ? "Logging in..." : "Log in now"}
            onClick={handleLogin}
            isDisabled={email.length === 0 || password.length === 0 || isLoading}
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