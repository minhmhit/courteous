import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  Wallet,
  FileText,
} from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import { employeeAPI } from "../../services";

const EmployeeLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [employeeProfile, setEmployeeProfile] = useState(undefined);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await employeeAPI.getMyProfile();
        if (isMounted) {
          setEmployeeProfile(res?.data || res || null);
        }
      } catch (error) {
        if (isMounted) {
          setEmployeeProfile(null);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const menuItems = useMemo(
    () => [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/employee/dashboard",
      },
      {
        icon: CalendarCheck,
        label: "Điểm danh",
        path: "/employee/attendance",
      },
      {
        icon: FileText,
        label: "Xin nghỉ",
        path: "/employee/leave",
      },
      {
        icon: Wallet,
        label: "Xem lương",
        path: "/employee/payroll",
      },
    ],
    [],
  );

  if (employeeProfile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff8f1,#f5ede3)] px-4">
        <div className="rounded-[28px] bg-white/80 px-6 py-5 text-sm text-stone-600 shadow-sm">
          Đang tải khu vực nhân viên...
        </div>
      </div>
    );
  }

  if (!employeeProfile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8f1,#f5ede3)] px-3 py-3 md:px-6 md:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col gap-4 lg:flex-row">
        <aside className="glass-panel-strong flex w-full flex-col rounded-[32px] border-white/35 bg-[linear-gradient(180deg,rgba(129,83,57,0.18),rgba(102,66,45,0.1))] p-4 lg:w-72 lg:p-5">
          <div className="mb-4 rounded-[28px] bg-white/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-700">
              Nhân viên
            </p>
            <h1 className="mt-2 text-2xl font-bold text-coffee-950">
              {user?.name || user?.username || "Tài khoản"}
            </h1>
            <p className="mt-1 text-sm text-stone-700">
              Mã NV: {employeeProfile.employeeCode || employeeProfile.employee_code || "N/A"}
            </p>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/78 text-coffee-900 shadow-[0_14px_34px_rgba(44,24,14,0.18)]"
                      : "bg-white/20 text-stone-700 hover:bg-white/32 hover:text-coffee-900"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
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

        <main className="glass-panel flex-1 overflow-hidden rounded-[32px] border-white/35 bg-[linear-gradient(180deg,rgba(255,250,245,0.46),rgba(255,248,241,0.2))]">
          <div className="h-full overflow-auto p-5 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
