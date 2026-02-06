import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const RoleRedirect = () => {
  const { profile, loading } = useAuth();

  if (!profile) return null;

  return (
    <Navigate to={profile.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} replace/>
  );
};

export default RoleRedirect;
