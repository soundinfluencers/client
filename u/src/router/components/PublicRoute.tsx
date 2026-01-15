import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { ReactNode } from "react";
import { useUserStore } from "../../store/user/useUserStore";

interface Props {
  children: ReactNode;
}

export const PublicRoute = ({ children }: Props) => {
  const { accessToken } = useAuth();
  const { user } = useUserStore();

  if (accessToken) {
    const route = user?.role === "influencer" ? "/dashboard" : user?.role === "client" ? "/client/home" : "/";

    return <Navigate to={route} replace />;
  }

  return <>{children}</>;
};
