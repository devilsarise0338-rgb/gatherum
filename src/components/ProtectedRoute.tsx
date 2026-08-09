import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, Role } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  /** Set true for routes that should be accessible even before profile_completed is true (e.g. /complete-profile itself). */
  skipProfileCheck?: boolean;
}

export default function ProtectedRoute({ allowedRoles, skipProfileCheck }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Gate: redirect to profile completion form if not done yet.
  if (!skipProfileCheck && !user.profileCompleted && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  // If profile is done and they try to revisit /complete-profile, send them home.
  if (skipProfileCheck && user.profileCompleted) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
}
