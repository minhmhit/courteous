import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
  CalendarCheck,
  ChevronDown,
  User,
  Wallet,
} from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";

const MENU_GROUPS = [
  { id: "dashboards", label: "Dashboard", icon: LayoutDashboard },
  { id: "sales", label: "Kinh doanh", icon: TrendingUp },
  { id: "catalog", label: "Catalog", icon: Package },
  { id: "warehouse", label: "Kho", icon: Warehouse },
  { id: "people", label: "Người dùng", icon: Users },
  { id: "hr", label: "Nhân sự", icon: UserCog },
  { id: "self", label: "Cá nhân", icon: User },
  { id: "system", label: "Hệ thống", icon: Settings },
];

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
    {
      icon: LayoutDashboard,
      label: "Dashboard Admin",
      path: "/admin/dashboard",
      allowedRoles: [1],
      group: "dashboards",
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard Kho",
      path: "/admin/warehouse-dashboard",
      allowedRoles: [3],
      group: "dashboards",
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard Bán Hàng",
      path: "/admin/sales-dashboard",
      allowedRoles: [4],
      group: "dashboards",
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard Nhân Sự",
      path: "/admin/hrm-dashboard",
      allowedRoles: [5],
      group: "dashboards",
    },
    {
      icon: TrendingUp,
      label: "Phân tích",
      path: "/admin/analytics",
      allowedRoles: [1],
      group: "sales",
    },
    {
      icon: ShoppingCart,
      label: "Đơn hàng",
      path: "/admin/orders",
      allowedRoles: [1, 4],
      group: "sales",
    },
    {
      icon: Tag,
      label: "Mã giảm giá",
      path: "/admin/coupons",
      allowedRoles: [1, 4],
      group: "sales",
    },
    {
      icon: Package,
      label: "Sản phẩm",
      path: "/admin/products",
      allowedRoles: [1, 3, 4],
      group: "catalog",
    },
    {
      icon: FolderOpen,
      label: "Danh mục",
      path: "/admin/categories",
      allowedRoles: [1, 3],
      group: "catalog",
    },
    {
      icon: Warehouse,
      label: "Kho hàng",
      path: "/admin/warehouse",
      allowedRoles: [1, 3],
      group: "warehouse",
    },
    {
      icon: Truck,
      label: "Nhà cung cấp",
      path: "/admin/suppliers",
      allowedRoles: [1, 3],
      group: "warehouse",
    },
    {
      icon: Users,
      label: "Người dùng",
      path: "/admin/users",
      allowedRoles: [1, 5],
      group: "people",
    },
    {
      icon: UserCog,
      label: "Nhân sự (HRM)",
      path: "/admin/hrm",
      allowedRoles: [1, 5],
      group: "hr",
    },
    {
      icon: CalendarCheck,
      label: "Điểm danh",
      path: "/admin/attendance",
      allowedRoles: [1, 5],
      group: "hr",
    },
    {
      icon: User,
      label: "Hồ sơ",
      path: "/admin/profile",
      allowedRoles: [1, 3, 4, 5],
      group: "self",
    },
    {
      icon: CalendarCheck,
      label: "Nghỉ phép",
      path: "/admin/leave",
      allowedRoles: [1, 3, 4, 5],
      group: "self",
    },
    {
      icon: Wallet,
      label: "Bảng lương",
      path: "/admin/payroll",
      allowedRoles: [1, 3, 4, 5],
      group: "self",
    },
    {
      icon: Settings,
      label: "Cài đặt",
      path: "/admin/settings",
      allowedRoles: [1],
      group: "system",
    },
  ];

  const menuItems = allMenuItems.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  const groupsWithItems = useMemo(() => {
    return MENU_GROUPS
      .map((group) => ({
        ...group,
        items: menuItems.filter((item) => item.group === group.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [menuItems]);

  const activeGroupId = useMemo(() => {
    const match = groupsWithItems.find((group) =>
      group.items.some((item) => location.pathname === item.path)
    );
    return match?.id || groupsWithItems[0]?.id || "";
  }, [groupsWithItems, location.pathname]);

  const [openGroup, setOpenGroup] = useState(activeGroupId);

  useEffect(() => {
    if (activeGroupId) {
      setOpenGroup(activeGroupId);
    }
  }, [activeGroupId]);

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
        <aside className="glass-panel-strong flex w-full flex-col rounded-[32px] p-4 lg:w-72 lg:p-5">
          <div className="mb-4 rounded-[28px] bg-white/25 p-4">
            <h1 className="text-2xl font-bold text-coffee-950">Admin Panel</h1>
            <p className="mt-1 text-sm text-slate-600">{user?.name || user?.username}</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleInfo.color}`}>
              {roleInfo.name}
            </span>
          </div>

          <nav className="flex-1 space-y-3 overflow-hidden">
            {groupsWithItems.map((group) => {
              const isOpen = openGroup === group.id;
              return (
                <div key={group.id} className="rounded-2xl bg-white/20 p-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup((prev) => (prev === group.id ? "" : group.id))
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white/40"
                  >
                    <span className="flex items-center gap-3">
                      <group.icon className="h-4 w-4 text-coffee-700" />
                      {group.label}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-2 grid gap-1">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all ${isActive
                                ? "bg-white/70 text-coffee-800 shadow-[0_10px_30px_rgba(72,45,24,0.12)]"
                                : "text-slate-700 hover:bg-white/40 hover:text-coffee-700"
                              }`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50/80"
          >
            <LogOut className="h-5 w-5" />
            <span>Đăng xuất</span>
          </button>
        </aside>

        <main className="glass-panel flex-1 overflow-hidden rounded-[32px]">
          <div className="h-full overflow-auto p-5 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
