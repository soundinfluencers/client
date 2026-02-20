import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { ReactNode } from "react";
import { useUser } from "@/store/get-user";
import { Loader } from "@/components";

interface Props {
  children: ReactNode;
}

export const PublicRoute = ({ children }: Props) => {
  const { accessToken, isAuthReady } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  const isShareRoute = location.pathname.startsWith("/promo-share");

  if (!isAuthReady) {
    return <Loader />;
  }

  if (accessToken && !isShareRoute) {
    if (!user) {
      return <Loader />;
    }

    let route = "/";

    switch (user.role) {
      case "influencer":
        route = "/influencer";
        break;
      case "client":
        route = "/client";
        break;
    }

    return <Navigate to={route} replace />;
  }

  return <>{children}</>;
};
