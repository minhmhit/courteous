import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

const extractRoleId = (user) =>
  user?.roleId ||
  user?.role_id ||
  user?.role?.id ||
  (typeof user?.role === "number" ? user.role : null);

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
  const actuallyAuthenticated = isAuthenticated || Boolean(token && storedUser);

  if (!actuallyAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles && requiredRole === null) {
    return children;
  }

  let userRole = extractRoleId(user);

  if (!userRole && storedUser) {
    try {
      userRole = extractRoleId(JSON.parse(storedUser));
    } catch (error) {
      console.error("Failed to parse stored user:", error);
    }
  }

  if (adminBypass && userRole === 1) {
    return children;
  }

  let hasPermission = false;
  if (requiredRole !== null) {
    hasPermission = userRole === requiredRole;
  } else if (Array.isArray(allowedRoles)) {
    hasPermission = allowedRoles.includes(userRole);
  } else if (typeof allowedRoles === "number") {
    hasPermission = userRole === allowedRoles;
  }

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
