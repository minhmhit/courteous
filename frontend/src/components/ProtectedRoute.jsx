import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

const ProtectedRoute = ({
  children,
  allowedRoles = null,
  adminBypass = true,
  requiredRole = null,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const actuallyAuthenticated = isAuthenticated || (token && storedUser);

  if (!actuallyAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles && !requiredRole) {
    return children;
  }

  let userRole = user?.roleId || user?.role_id || user?.role;

  if (!userRole && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      userRole = parsedUser?.roleId || parsedUser?.role_id || parsedUser?.role;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
    }
  }

  userRole = Number(userRole);

  if (adminBypass && userRole === 1) {
    return children;
  }

  let hasPermission = false;

  if (requiredRole !== null) {
    hasPermission = userRole === Number(requiredRole);
  } else if (Array.isArray(allowedRoles)) {
    hasPermission = allowedRoles.map(Number).includes(userRole);
  } else if (typeof allowedRoles === "number") {
    hasPermission = userRole === allowedRoles;
  }

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
