import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { ReactNode } from "react";
import { useUser } from "@/store/get-user";

interface Props {
  children: ReactNode;
}

export const PublicRoute = ({ children }: Props) => {
  const { accessToken } = useAuth();
  const { user } = useUser();

  if (accessToken) {
    const route = user?.role === "influencer" ? "/" : "/";

    return <Navigate to={route} replace />;
  }

  return <>{children}</>;
};
