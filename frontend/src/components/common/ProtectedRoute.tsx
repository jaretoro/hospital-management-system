import { Navigate } from "react-router-dom";
import { isAuthenticated, getUser } from "@/lib/auth";

interface ProtectedRouteProps {
  children:     React.ReactNode;
  requiredRole?: "admin" | "doctor" | "nurse";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const authenticated = isAuthenticated();
  const user          = getUser();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nurse goes to admin layout
  if (requiredRole === "admin" && user?.role !== "nurse" && user?.role !== "admin") {
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  if (requiredRole === "doctor" && user?.role !== "doctor") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}