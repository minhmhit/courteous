import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

/**
 *Role
 *0. Người dùng chưa đăng nhập: `0`
 *1. Quản lý doanh nghiệp có tất cả các quyền (admin): `1`
 *2. Người dùng đã đăng nhập: `2`
 *3. Quản lý kho (warehouse): `3`
 *4. Nhân viên bán hàng (sales): `4`
 *5. Nhân viên quản lý user (hrm): `5`
 */

//middleware để bảo vệ các route cần đăng nhập hoặc có quyền truy cập nhất định


const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role nếu cần
  if (requiredRole && user?.roleId !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
