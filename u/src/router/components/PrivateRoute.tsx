import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "@/store/get-user";
import { Loader } from "@/components";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: Props) => {
  const { accessToken, isAuthReady } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  if (!isAuthReady) {
    return <Loader />;
  }

  if (!accessToken) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!user) {
    return <Loader />;
  }

  const isClientRoute = location.pathname === "/client" || location.pathname.startsWith("/client/");
  if (isClientRoute && user.role !== "client") {
    return <Navigate to="/influencer" replace />;
  }

  return <>{children}</>;
};
