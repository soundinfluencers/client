import { Navigate } from "react-router-dom";
import { useUser } from "@/store/get-user";

export const RootRedirect = () => {
  const { user } = useUser();
  console.log("user after login:", user);

  if (user?.role === "client") {
    console.log("Redirecting to client dashboard");
    return <Navigate to="/client" replace />;
  }

  if (user?.role === "influencer") {
    console.log("Redirecting to influencer dashboard");
    return <Navigate to="/influencer" replace />;
  }

  console.log("User role is undefined or unrecognized, redirecting to login");
  return <Navigate to="/login" replace />;
};
