import { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

type ProtectedRouteProps = {
  children: JSX.Element;
  role?: "user" | "admin";
};

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if(!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (role && !profile) return <div>Loading...</div>;
  
  if (role && profile?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
