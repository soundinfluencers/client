import React, { Suspense } from "react";
import { type FC } from "react";
import { SignupClient } from "./components/layout/SignupClient.tsx";
// import { SignupInfluencer } from "./components/layout/SignupInfluencer.tsx";

import { useLocation } from "react-router-dom";
import { Loader } from "@/shared/ui";

const SignupInfluencer = React.lazy(() => import("./components/layout/SignupInfluencer.tsx"));

export const SignupPage: FC = () => {
  const location = useLocation();

  return (
    <div className="signup-page">
      {location.pathname === '/signup/client' && <SignupClient/>}
      {location.pathname === '/signup/influencer' && (
        <Suspense fallback={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loader/>
          </div>
        }>
          <SignupInfluencer/>
        </Suspense>
      )}
    </div>
  )
}