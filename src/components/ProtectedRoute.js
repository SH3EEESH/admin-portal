import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Guards a route on the frontend. The real enforcement always has to live in the Express middleware (a user could edit localStorage), but this is
 * what stops a normal EndUser from ever rendering an Admin-only page or poking around a protected URL without a session, matching Flow A/B from the proposal.
 *
 * requiredRole: "admin" | "user" | undefined (any authenticated role)
 */
export default function ProtectedRoute({ requiredRole, children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
