import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Loader } from "@/components";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: Props) => {
  const { accessToken, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return <Loader />;
  }

  if (!accessToken) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
