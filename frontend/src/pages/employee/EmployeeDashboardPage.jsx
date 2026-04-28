import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  ChevronRight,
  Clock3,
  FileText,
  Wallet,
} from "lucide-react";
import { attendanceAPI, employeeAPI, leaveAPI, payrollAPI } from "../../services";
import { formatCurrency } from "../../utils/formatDate";
import useAuthStore from "../../stores/useAuthStore";

const extractList = (res, keys = []) => {
  const data = res?.data || res;
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getLocalDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value || "").slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getAttendanceDateKey = (item) => {
  const timestampValue =
    item?.checkIn ||
    item?.check_in ||
    item?.timeIn ||
    item?.checkOut ||
    item?.check_out ||
    item?.timeOut;

  if (timestampValue) {
    return getLocalDateKey(timestampValue);
  }

  return getLocalDateKey(
    item?.date || item?.attendanceDate || item?.attendance_date || item?.workDate,
  );
};

const EmployeeDashboardPage = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [monthlyPayroll, setMonthlyPayroll] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const todayKey = getLocalDateKey(now);
        const roleId = Number(user?.roleId || user?.role_id || user?.role || 0);

        const [profileRes, attendanceRes, leaveRes] = await Promise.all([
          employeeAPI.getMyProfile().catch(() => null),
          attendanceAPI.getMyAttendance({ month, year }).catch(() => null),
          leaveAPI.getMyLeaveRequests().catch(() => null),
        ]);

        const profile = profileRes?.data || profileRes || null;
        const payrollRes =
          [3, 4, 5].includes(roleId) && profile?.id
            ? await payrollAPI
                .getEmployeeMonthlySlip(profile.id, { month, year })
                .catch(() => null)
            : await payrollAPI.getMyMonthlySlip({ month, year }).catch(() => null);

        if (!isMounted) return;

        const attendances = extractList(attendanceRes, ["attendances"]);
        const leaves = extractList(leaveRes, ["leaveRequests"]);
        const payrollList = extractList(payrollRes, ["payrolls"]);
        const payrollPayload = payrollRes?.data || payrollRes;
        const todayRecord =
          attendances.find((item) => getAttendanceDateKey(item) === todayKey) || null;

        setEmployeeProfile(profile);
        setTodayAttendance(todayRecord);
        setLeaveRequests(leaves);
        setMonthlyPayroll(
          payrollList[0] || payrollPayload?.payroll || payrollPayload?.data?.payroll || null,
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const pendingLeaveCount = useMemo(
    () =>
      leaveRequests.filter((item) => {
        const status = String(
          item.status || item.requestStatus || item.approvalStatus || "",
        ).toUpperCase();
        return status === "PENDING";
      }).length,
    [leaveRequests],
  );

  const attendanceLabel = useMemo(() => {
    if (!todayAttendance) return "Chưa điểm danh";
    const checkIn =
      todayAttendance.checkIn || todayAttendance.check_in || todayAttendance.timeIn;
    const checkOut =
      todayAttendance.checkOut || todayAttendance.check_out || todayAttendance.timeOut;

    if (checkIn && checkOut) return "Đã check-in / check-out";
    if (checkIn) return "Đã check-in";
    return String(todayAttendance.status || "Đã ghi nhận");
  }, [todayAttendance]);

  const cards = [
    {
      title: "Điểm danh hôm nay",
      value: attendanceLabel,
      icon: CalendarCheck,
      link: "/employee/attendance",
      tone: "from-emerald-500/20 to-emerald-100/70",
    },
    {
      title: "Đơn nghỉ chờ duyệt",
      value: `${pendingLeaveCount} đơn`,
      icon: FileText,
      link: "/employee/leave",
      tone: "from-amber-500/20 to-amber-100/70",
    },
    {
      title: "Lương tháng này",
      value: formatCurrency(
        monthlyPayroll?.totalSalary ||
          monthlyPayroll?.total_salary ||
          monthlyPayroll?.netSalary ||
          monthlyPayroll?.amount ||
          0,
      ),
      icon: Wallet,
      link: "/employee/payroll",
      tone: "from-sky-500/20 to-sky-100/70",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Nhân viên</h1>
        <p className="mt-1 text-gray-600">
          Điểm danh, xin nghỉ và theo dõi lương của bạn tại một nơi.
        </p>
      </div>

      <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(252,242,232,0.88))] p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-700">
          Hồ sơ
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Nhân viên</p>
            <p className="text-lg font-semibold text-gray-900">
              {employeeProfile?.userName ||
                employeeProfile?.name ||
                employeeProfile?.user?.name ||
                "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Mã nhân viên</p>
            <p className="text-lg font-semibold text-gray-900">
              {employeeProfile?.employeeCode || employeeProfile?.employee_code || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Trạng thái</p>
            <p className="text-lg font-semibold text-gray-900">
              {employeeProfile?.employmentStatus || employeeProfile?.status || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`rounded-[28px] border border-white/60 bg-gradient-to-br ${card.tone} p-6 shadow-sm transition-transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-white/70 p-3">
                <card.icon className="h-6 w-6 text-coffee-800" />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-5 text-sm text-gray-600">{card.title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {isLoading ? "..." : card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-coffee-700" />
            <h2 className="text-lg font-semibold text-gray-900">Điểm danh hôm nay</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <p>
              Check-in:{" "}
              <span className="font-medium text-gray-900">
                {todayAttendance?.checkIn ||
                  todayAttendance?.check_in ||
                  "--"}
              </span>
            </p>
            <p>
              Check-out:{" "}
              <span className="font-medium text-gray-900">
                {todayAttendance?.checkOut ||
                  todayAttendance?.check_out ||
                  "--"}
              </span>
            </p>
            <p>
              Trạng thái:{" "}
              <span className="font-medium text-gray-900">{attendanceLabel}</span>
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-coffee-700" />
            <h2 className="text-lg font-semibold text-gray-900">Tác vụ nhanh</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <Link
              to="/employee/attendance"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 hover:border-coffee-300 hover:bg-coffee-50/60"
            >
              Chấm công ngay
            </Link>
            <Link
              to="/employee/leave"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 hover:border-coffee-300 hover:bg-coffee-50/60"
            >
              Gửi đơn nghỉ
            </Link>
            <Link
              to="/employee/payroll"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 hover:border-coffee-300 hover:bg-coffee-50/60"
            >
              Xem phiếu lương
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
