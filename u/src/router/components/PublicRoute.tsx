import { Navigate, useLocation } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "@/store/get-user";
import { Loader } from "@/shared/ui";
import {clearPostAuthRedirect, getPostAuthRedirect} from "@/utils/functions/getPostAuthRedirect.ts";


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



  // Consume only after commit: StrictMode may render Navigate more than once.
  useEffect(() => {
    if (isAuthReady && accessToken && user && !isAllowedPublicRoute) clearPostAuthRedirect();
  }, [isAuthReady, accessToken, user?.role, isAllowedPublicRoute]);

  if (!isAuthReady && !isAllowedPublicRoute) return <Loader />;

  if (accessToken && !isAllowedPublicRoute) {
    if (!user) return <Loader />;

    const redirectPath = getPostAuthRedirect();

    if (
        user.role === "client" && redirectPath &&
        redirectPath.startsWith("/") && !redirectPath.startsWith("//") &&
        redirectPath !== `${location.pathname}${location.search}`
    ) {
      return <Navigate to={redirectPath} replace />;
    }

    const route = user.role === "client" ? "/client" : "/influencer";
    return <Navigate to={route} replace />;
  }

  return <>{children}</>;
};