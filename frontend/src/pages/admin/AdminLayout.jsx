import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
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

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: TrendingUp, label: "Phân tích", path: "/admin/analytics" },
    { icon: Package, label: "Sản phẩm", path: "/admin/products" },
    { icon: FolderOpen, label: "Danh mục", path: "/admin/categories" },
    { icon: ShoppingCart, label: "Đơn hàng", path: "/admin/orders" },
    { icon: Warehouse, label: "Kho hàng", path: "/admin/warehouse" },
    { icon: Users, label: "Khách hàng", path: "/admin/users" },
    { icon: UserCog, label: "Nhân sự (HRM)", path: "/admin/hrm" },
    { icon: Settings, label: "Cài đặt", path: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-coffee-600">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
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
