import { type FC } from "react";
import { type NavigateFunction, useNavigate } from "react-router-dom";
import { TextInput } from "../../../components/ui/inputs/text-input/TextInput.tsx";
import { useLoginStore } from "../../../store/features/loginSlice.ts";
import { ButtonMain } from "../../../components/ui/buttons/button/Button.tsx";
import "./_login-page.scss";
import { useAuth } from "../../../contexts/AuthContext.tsx";
import { loginApi } from "../../../api/auth/auth.api.ts";
import type { ResponseLoginUserModel } from "../../../types/auth/auth.types.ts";
import { useClientUser } from "../../../store/get-user-client/index.ts";
import { useUserStore } from "../../../store/user/useUserStore.ts";
// import { useInfluencerStore } from "../../../store/influencer/index.ts";

export const LoginPage: FC = () => {
  const navigate: NavigateFunction = useNavigate();
  // const { setUser } = useClientUser();
  // const { setInfluencer } = useInfluencerStore();
  const { email, password, role, setEmail, setPassword } = useLoginStore();
  const { setUser, user } = useUserStore();
  const { setAccessToken } = useAuth();

  const handleLogin = async () => {
    const res: ResponseLoginUserModel = await loginApi({ email, password, role });
    console.log(res.accessToken, "res accessToken");
    console.log(res.role, "res role");
    console.log(res.firstName, "res firstName");
    console.log(res.balance, "res balance");

    if (res.accessToken && res.role) {
      setAccessToken(res.accessToken);
      setUser(res.firstName, res.balance, res.role);
      console.log(user);
      // navigate("/dashboard");
      // return;
    }

    // if (res.accessToken && res.role && res.role === "client") {
    //   console.log('client navigate');
    //   setAccessToken(res.accessToken);
    //   setUser(res.firstName, res.balance, res.role);
    //   // navigate("/client/home");
    //   return;
    // }

    // if (res.accessToken && res.role && res.id) {
    //   setUser(res.accessToken, res.id, res.role);
    //   setAccessToken(res.accessToken);
    // }
    // navigate("/client/home");
  };

  return (
    <div className="login-page__wrapper">
      <p className="login-page__title">Log in to your {role === "client" ? "Client" : "Influencer"} Dashboard</p>
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
            onClick={() => navigate(`/signup/${role}`)}>
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};


//TODO: Loader component move to components/ui/loaders
// export const Load = () => {

//   return (
//     <div className="loader">
//       <svg viewBox="0 0 200 200" width="220" height="220">
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
//                   y1="30"
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
// }
