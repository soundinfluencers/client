import { type FC } from "react";
import { SignupClient } from "./components/layout/SignupClient.tsx";
import { SignupInfluencer } from "./components/layout/SignupInfluencer.tsx";
import { useLocation } from "react-router-dom";

export const SignupPage: FC = () => {
  const location = useLocation();

  return (
    <div className="signup-page">
      {location.pathname === '/signup/client' && <SignupClient />}
      {location.pathname === '/signup/influencer' && <SignupInfluencer />}
    </div>
  )
}