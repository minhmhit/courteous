import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
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
  Tag,
  Truck,
} from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  let userRole = user?.roleId || user?.role_id || user?.role;

  if (!userRole) {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userRole = parsedUser?.roleId || parsedUser?.role_id || parsedUser?.role;
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }
  }

  useEffect(() => {
    if (window.location.pathname === "/admin" || window.location.pathname === "/admin/") {
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

  const allMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard Admin", path: "/admin/dashboard", allowedRoles: [1] },
    { icon: LayoutDashboard, label: "Dashboard Kho", path: "/admin/warehouse-dashboard", allowedRoles: [3] },
    { icon: LayoutDashboard, label: "Dashboard Bán Hàng", path: "/admin/sales-dashboard", allowedRoles: [4] },
    { icon: LayoutDashboard, label: "Dashboard Nhân Sự", path: "/admin/hrm-dashboard", allowedRoles: [5] },
    { icon: TrendingUp, label: "Phân tích", path: "/admin/analytics", allowedRoles: [1] },
    { icon: Package, label: "Sản phẩm", path: "/admin/products", allowedRoles: [1, 3, 4] },
    { icon: Tag, label: "Mã giảm giá", path: "/admin/coupons", allowedRoles: [1, 4] },
    { icon: FolderOpen, label: "Danh mục", path: "/admin/categories", allowedRoles: [1, 3] },
    { icon: ShoppingCart, label: "Đơn hàng", path: "/admin/orders", allowedRoles: [1, 4] },
    { icon: Warehouse, label: "Kho hàng", path: "/admin/warehouse", allowedRoles: [1, 3] },
    { icon: Truck, label: "Nhà cung cấp", path: "/admin/suppliers", allowedRoles: [1, 3] },
    { icon: Users, label: "Người dùng", path: "/admin/users", allowedRoles: [1, 5] },
    { icon: UserCog, label: "Nhân sự (HRM)", path: "/admin/hrm", allowedRoles: [1, 5] },
    { icon: Settings, label: "Cài đặt", path: "/admin/settings", allowedRoles: [1] },
  ];

  const menuItems = allMenuItems.filter((item) => item.allowedRoles.includes(userRole));

  const getRoleName = (roleId) => {
    const roles = {
      1: { name: "Admin", color: "bg-rose-100/80 text-rose-700" },
      2: { name: "Customer", color: "bg-sky-100/80 text-sky-700" },
      3: { name: "Warehouse", color: "bg-emerald-100/80 text-emerald-700" },
      4: { name: "Sales", color: "bg-violet-100/80 text-violet-700" },
      5: { name: "HRM", color: "bg-amber-100/80 text-amber-700" },
    };
    return roles[roleId] || { name: "Unknown", color: "bg-slate-100/80 text-slate-700" };
  };

  const roleInfo = getRoleName(userRole);

  return (
    <div className="min-h-screen px-3 py-3 md:px-6 md:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col gap-4 lg:flex-row">
        <aside className="glass-panel-strong w-full rounded-[32px] p-4 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-64 lg:p-4">
          <div className="mb-5 rounded-[28px] bg-white/25 p-5">
            <h1 className="text-2xl font-bold text-coffee-950">Admin Panel</h1>
            <p className="mt-1 text-sm text-slate-600">{user?.name || user?.username}</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleInfo.color}`}>
              {roleInfo.name}
            </span>
          </div>

          <div className="lg:flex lg:h-[calc(100%-9.5rem)] lg:flex-col">
            <nav className="space-y-2 lg:flex-1 lg:overflow-y-auto lg:pr-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/65 text-coffee-800 shadow-[0_10px_30px_rgba(72,45,24,0.12)]"
                        : "text-slate-700 hover:bg-white/35 hover:text-coffee-700"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50/80 lg:mt-3"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        <main className="glass-panel flex-1 overflow-hidden rounded-[32px] lg:h-[calc(100vh-2.5rem)]">
          <div className="h-full overflow-auto p-5 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
