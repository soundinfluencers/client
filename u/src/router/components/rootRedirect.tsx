import { Navigate } from "react-router-dom";
import { useUser } from "@/store/get-user";

export const RootRedirect = () => {
  const { user } = useUser();
console.log(user,'user')
  if (user?.role === "client") {
    return <Navigate to="/client" replace />;
  }

  if (user?.role === "influencer") {
    return <Navigate to="/influencer" replace />;
  }

  return <Navigate to="/login" replace />;
};
