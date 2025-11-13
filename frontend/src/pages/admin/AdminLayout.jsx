import { Outlet, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  FolderOpen,
  Warehouse,
  UserCog,
  TrendingUp,
} from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Lấy roleId từ user
  const userRole = user?.roleId || user?.role_id || user?.role;

  // Redirect to role-specific dashboard when accessing /admin
  useEffect(() => {
    // Only redirect if on exactly /admin (not sub-routes)
    if (
      window.location.pathname === "/admin" ||
      window.location.pathname === "/admin/"
    ) {
      if (userRole === 3) {
        navigate("/admin/warehouse-dashboard", { replace: true });
      } else if (userRole === 4) {
        navigate("/admin/sales-dashboard", { replace: true });
      } else if (userRole === 5) {
        navigate("/admin/hrm-dashboard", { replace: true });
      } else if (userRole === 1) {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [userRole, navigate]);

  // Định nghĩa menu items với allowedRoles
  const allMenuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard Admin",
      path: "/admin/dashboard",
      allowedRoles: [1], // Admin only
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard Kho",
      path: "/admin/warehouse-dashboard",
      allowedRoles: [3], // Warehouse only
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard Bán Hàng",
      path: "/admin/sales-dashboard",
      allowedRoles: [4], // Sales only
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard Nhân Sự",
      path: "/admin/hrm-dashboard",
      allowedRoles: [5], // HRM only
    },
    {
      icon: TrendingUp,
      label: "Phân tích",
      path: "/admin/analytics",
      allowedRoles: [1], // Admin only
    },
    {
      icon: Package,
      label: "Sản phẩm",
      path: "/admin/products",
      allowedRoles: [1, 3], // Admin & Warehouse
    },
    {
      icon: FolderOpen,
      label: "Danh mục",
      path: "/admin/categories",
      allowedRoles: [1, 3], // Admin & Warehouse
    },
    {
      icon: ShoppingCart,
      label: "Đơn hàng",
      path: "/admin/orders",
      allowedRoles: [1, 4], // Admin & Sales
    },
    {
      icon: Warehouse,
      label: "Kho hàng",
      path: "/admin/warehouse",
      allowedRoles: [1, 3], // Admin & Warehouse
    },
    {
      icon: Users,
      label: "Khách hàng",
      path: "/admin/users",
      allowedRoles: [1, 5], // Admin & HRM
    },
    {
      icon: UserCog,
      label: "Nhân sự (HRM)",
      path: "/admin/hrm",
      allowedRoles: [1, 5], // Admin & HRM
    },
    {
      icon: Settings,
      label: "Cài đặt",
      path: "/admin/settings",
      allowedRoles: [1], // Admin only
    },
  ];

  // Lọc menu items theo role
  const menuItems = allMenuItems.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  // Get role name
  const getRoleName = (roleId) => {
    const roles = {
      1: { name: "Admin", color: "bg-red-100 text-red-800" },
      2: { name: "Customer", color: "bg-blue-100 text-blue-800" },
      3: { name: "Warehouse", color: "bg-green-100 text-green-800" },
      4: { name: "Sales", color: "bg-purple-100 text-purple-800" },
      5: { name: "HRM", color: "bg-yellow-100 text-yellow-800" },
    };
    return (
      roles[roleId] || { name: "Unknown", color: "bg-gray-100 text-gray-800" }
    );
  };

  const roleInfo = getRoleName(userRole);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-coffee-600">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user?.name || user?.username}
          </p>
          <span
            className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}
          >
            {roleInfo.name}
          </span>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 mb-2 text-gray-700 hover:bg-coffee-50 hover:text-coffee-600 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}

          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
