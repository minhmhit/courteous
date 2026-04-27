import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Clock3, TimerReset, UserRound } from "lucide-react";
import { attendanceAPI, employeeAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import useAuthStore from "../../stores/useAuthStore";

const getProfileFromResponse = (response) => {
  const payload = response?.data || response;
  return (
    payload?.data?.employee || payload?.data || payload?.employee || payload
  );
};

const getAttendanceList = (response) => {
  const payload = response?.data || response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.attendances)) return payload.attendances;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.attendances))
    return payload.data.attendances;
  return [];
};

const normalizeStatus = (value) => String(value || "PRESENT").toUpperCase();

const STATUS_CONFIG = {
  PRESENT: { label: "Đi làm", className: "bg-emerald-100 text-emerald-700" },
  LATE: { label: "Đi trễ", className: "bg-amber-100 text-amber-700" },
  DELAY: { label: "Đi trễ", className: "bg-amber-100 text-amber-700" },
  ABSENT: { label: "Vắng", className: "bg-rose-100 text-rose-700" },
  UNPAID_LEAVE: {
    label: "Nghỉ không lương",
    className: "bg-slate-200 text-slate-700",
  },
  SICK_LEAVE: { label: "Nghỉ ốm", className: "bg-cyan-100 text-cyan-700" },
};

const getStatusConfig = (value) => {
  const key = normalizeStatus(value);
  return (
    STATUS_CONFIG[key] || {
      label: key,
      className: "bg-slate-200 text-slate-700",
    }
  );
};

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
};

const formatTime = (value) => {
  if (!value) return "--";
  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMinutes = (item) => {
  const raw = item?.workMinutes || item?.work_minutes;
  const num = Number(raw || 0);
  return Number.isFinite(num) ? num : 0;
};

const getOvertimeMinutes = (item) => {
  const raw = item?.overtimeMinutes || item?.overtime_minutes;
  const num = Number(raw || 0);
  return Number.isFinite(num) ? num : 0;
};

const WORK_HOURS_PER_DAY = 9;

const getOvertimeHoursByTotalHours = (workMinutes) => {
  const totalHours = Number(workMinutes || 0) / 60;
  return Math.max(totalHours - WORK_HOURS_PER_DAY, 0);
};

const getMonthInputValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

const AdminMyAttendancePage = () => {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [isLoading, setIsLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(getMonthInputValue());
  const [employeeName, setEmployeeName] = useState("");
  const [records, setRecords] = useState([]);

  const fetchMyAttendance = async () => {
    setIsLoading(true);
    try {
      const profileRes = await employeeAPI.getMyProfile();
      const profile = getProfileFromResponse(profileRes);
      setEmployeeName(
        profile?.userName ||
          profile?.name ||
          profile?.fullName ||
          profile?.employee_name ||
          "Nhân viên",
      );

      const [yearStr, monthStr] = monthFilter.split("-");
      const query = {
        month: Number(monthStr),
        year: Number(yearStr),
        userId: user?.id || user?.userId || user?.user_id,
      };

      const attendanceRes = await attendanceAPI.getMyAttendance(query);
      const list = getAttendanceList(attendanceRes);

      const normalized = list
        .map((item) => ({
          id:
            item.id ||
            `${item.employeeId || item.employee_id}-${item.workDate || item.work_date}`,
          workDate: item.workDate || item.work_date,
          checkIn: item.checkIn || item.check_in,
          checkOut: item.checkOut || item.check_out,
          status: normalizeStatus(item.status),
          note: item.note || "",
          workMinutes: getMinutes(item),
          overtimeMinutes: getOvertimeMinutes(item),
        }))
        .sort(
          (a, b) =>
            new Date(b.workDate).getTime() - new Date(a.workDate).getTime(),
        );

      setRecords(normalized);
    } catch (error) {
      console.error("Error fetching my attendance:", error);
      const message =
        error?.message ||
        error?.error ||
        "Không thể tải dữ liệu chấm công cá nhân";
      toast.error(message);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthFilter]);

  const stats = useMemo(() => {
    const workDays = records.filter((item) => item.status !== "ABSENT").length;
    const absentDays = records.filter(
      (item) => item.status === "ABSENT",
    ).length;
    const totalMinutes = records.reduce(
      (sum, item) => sum + item.workMinutes,
      0,
    );
    const totalOvertimeHours = records.reduce(
      (sum, item) => sum + getOvertimeHoursByTotalHours(item.workMinutes),
      0,
    );

    return {
      workDays,
      absentDays,
      totalHours: (totalMinutes / 60).toFixed(1),
      overtimeHours: totalOvertimeHours.toFixed(1),
    };
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chấm công của tôi
          </h1>
          <p className="mt-1 text-gray-600">
            Theo dõi điểm danh cá nhân theo từng tháng
            {employeeName ? ` - ${employeeName}` : ""}
          </p>
        </div>

        <div className="w-full md:w-56">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tháng
          </label>
          <input
            type="month"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            className="glass-input w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-sm text-slate-500">Ngày có chấm công</p>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <CalendarCheck className="h-5 w-5 text-emerald-600" />
            {stats.workDays}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-sm text-slate-500">Ngày vắng</p>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <UserRound className="h-5 w-5 text-rose-600" />
            {stats.absentDays}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-sm text-slate-500">Tổng giờ làm</p>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Clock3 className="h-5 w-5 text-blue-600" />
            {stats.totalHours}h
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-sm text-slate-500">Tổng giờ tăng ca</p>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <TimerReset className="h-5 w-5 text-amber-600" />
            {stats.overtimeHours}h
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                <th className="px-4 py-3 text-left font-semibold">Giờ vào</th>
                <th className="px-4 py-3 text-left font-semibold">Giờ ra</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left font-semibold">Giờ làm</th>
                <th className="px-4 py-3 text-left font-semibold">OT</th>
                <th className="px-4 py-3 text-left font-semibold">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && records.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Chưa có dữ liệu chấm công trong tháng này.
                  </td>
                </tr>
              )}

              {records.map((item) => {
                const statusConfig = getStatusConfig(item.status);
                return (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-800">
                      {formatDate(item.workDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatTime(item.checkIn)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatTime(item.checkOut)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {(item.workMinutes / 60).toFixed(1)}h
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {getOvertimeHoursByTotalHours(item.workMinutes).toFixed(
                        1,
                      )}
                      h
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.note || "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMyAttendancePage;
