import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

/**
 * 🔐 Hệ Thống Phân Quyền
 *
 * Role Definitions:
 * 0. Guest (Khách): Người dùng chưa đăng nhập
 * 1. Admin: Quản lý doanh nghiệp - Có tất cả các quyền (bypass all checks)
 * 2. Customer: Người dùng đã đăng nhập - Mua hàng, xem đơn hàng
 * 3. Warehouse: Quản lý kho - Nhập hàng, quản lý inventory
 * 4. Sales: Nhân viên bán hàng - Xử lý đơn hàng, tạo hóa đơn
 * 5. HRM: Nhân viên quản lý user - Quản lý nhân viên, phân quyền
 *
 * @see PERMISSIONS.md để xem chi tiết phân quyền từng trang
 */

/**
 * Protected Route Component
 *
 * @param {React.ReactNode} children - Component con cần bảo vệ
 * @param {number|number[]} allowedRoles - Role(s) được phép truy cập (mặc định: tất cả users đã đăng nhập)
 * @param {boolean} adminBypass - Admin có thể bypass không (mặc định: true)
 *
 * @example
 * // Chỉ customer và admin
 * <ProtectedRoute allowedRoles={[1, 2]}>
 *   <CartPage />
 * </ProtectedRoute>
 *
 * @example
 * // Warehouse và admin
 * <ProtectedRoute allowedRoles={[1, 3]}>
 *   <AdminWarehousePage />
 * </ProtectedRoute>
 *
 * @example
 * // Tất cả users đã đăng nhập
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({
  children,
  allowedRoles = null,
  adminBypass = true,
  // Legacy support
  requiredRole = null,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 1. Kiểm tra đăng nhập
  if (!isAuthenticated) {
    // Lưu location để redirect sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Nếu không có yêu cầu role cụ thể -> cho phép tất cả users đã đăng nhập
  if (!allowedRoles && !requiredRole) {
    return children;
  }

  // 3. Lấy roleId từ user
  const userRole = user?.roleId;
  // 4. Admin bypass (Role 1 có thể truy cập mọi trang)
  if (adminBypass && userRole === 1) {
    return children;
  }

  // 5. Kiểm tra role (hỗ trợ cả array và single value)
  let hasPermission = false;

  if (requiredRole !== null) {
    // Legacy: single role check
    hasPermission = userRole === requiredRole;
  } else if (Array.isArray(allowedRoles)) {
    // New: multiple roles
    hasPermission = allowedRoles.includes(userRole);
  } else if (typeof allowedRoles === "number") {
    // New: single role
    hasPermission = userRole === allowedRoles;
  }

  // 6. Không có quyền -> redirect về trang chủ
  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
