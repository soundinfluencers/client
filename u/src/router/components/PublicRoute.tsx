import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { ReactNode } from "react";
import { useUser } from "@/store/get-user";
import { Loader } from "@/shared/ui";
// import { Loader } from "@/components";

interface Props {
  children: ReactNode;
}

export const PublicRoute = ({ children }: Props) => {
  const { accessToken, isAuthReady } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const PUBLIC_ALLOWED_WHEN_AUTH = ["/promo-share", "/terms", "/privacy"];
  const isAllowedPublicRoute = PUBLIC_ALLOWED_WHEN_AUTH.some((p) =>
    location.pathname.startsWith(p),
  );
  if (!isAuthReady) {
    return <Loader />;
  }

  if (accessToken && !isAllowedPublicRoute) {
    console.log('User is authenticated, checking role for redirection:', user);
    if (!user) return <Loader />;

    let route = "/";
    switch (user.role) {
      case "influencer":
        console.log('User role is influencer, redirecting to influencer dashboard');
        route = "/influencer";
        break;
      case "client":
        console.log('User role is client, redirecting to client dashboard');
        route = "/client";
        break;
    }

    console.log(`Redirecting authenticated user to ${route} from ${location.pathname}`);
    return <Navigate to={route} replace />;
  }

  return <>{children}</>;
};
