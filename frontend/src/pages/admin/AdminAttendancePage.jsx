import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  Upload,
  Search,
  Edit,
  X,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { attendanceAPI, employeeAPI } from "../../services";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import { formatDate } from "../../utils/formatDate";

const AdminAttendancePage = () => {
  const toast = useToastStore();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const csvInputRef = useRef(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    workDate: "",
    checkIn: "",
    checkOut: "",
    status: "PRESENT",
    note: "",
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthFilter]);

  const normalizePayload = (payload) => {
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => value !== "" && value !== undefined && value !== null,
      ),
    );
    return cleaned;
  };

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const [yearStr, monthStr] = monthFilter.split("-");
      const response = await attendanceAPI.getAllAttendance(1, 200, {
        month: Number(monthStr),
        year: Number(yearStr),
      });
      const list = response?.attendances || response?.data || [];
      setAttendance(list);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Không thể tải dữ liệu điểm danh");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAllEmployees({
        page: 1,
        limit: 200,
      });
      const list =
        response?.data || response?.employees || response?.items || [];
      setEmployees(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const getEmployeeInfo = useCallback(
    (item) => {
      const employeeId = item.employeeId || item.employee_id;
      const employee = employees.find(
        (emp) => (emp.id || emp.employeeId) === employeeId,
      );
      return {
        id: employeeId,
        name:
          item.employeeName ||
          item.employee_name ||
          item.name ||
          employee?.user_name ||
          employee?.name ||
          employee?.fullName ||
          employee?.employee_name ||
          employee?.user?.name ||
          "N/A",
        email: employee?.user_email || employee?.email || employee?.user?.email,
      };
    },
    [employees],
  );

  const getEmployeeOptionLabel = (emp) => {
    const name =
      emp.name ||
      emp.fullName ||
      emp.employee_name ||
      emp.userName ||
      emp.user_name ||
      emp.user?.name ||
      emp.user?.fullName ||
      "";
    const email =
      emp.email || emp.user_email || emp.userEmail || emp.user?.email || "";
    if (name && email) return `${name} - ${email}`;
    if (name) return name;
    if (email) return email;
    return `Nhân viên #${emp.userId || emp.id || emp.employeeId || "?"}`;
  };

  const formatTime = (value) => {
    if (!value) return "--";
    if (typeof value === "string") {
      if (/^\\d{2}:\\d{2}/.test(value)) return value.slice(0, 5);
      if (value.includes("T")) {
        return new Date(value).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const parseCsvLine = (line) => {
    const result = [];
    let value = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          value += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(value.trim());
        value = "";
      } else {
        value += char;
      }
    }
    result.push(value.trim());
    return result;
  };

  const normalizeCsvHeader = (header) =>
    String(header || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  const parseCsvToRows = (csvText) => {
    const lines = String(csvText || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]).map(normalizeCsvHeader);
    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] ?? "";
      });
      return row;
    });
  };

  const toHHMM = (value) => {
    if (!value) return "";
    const str = String(value).trim();
    if (/^\d{2}:\d{2}$/.test(str)) return str;
    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str.slice(0, 5);
    if (str.includes("T")) {
      const date = new Date(str);
      if (!Number.isNaN(date.getTime())) {
        return `${String(date.getHours()).padStart(2, "0")}:${String(
          date.getMinutes(),
        ).padStart(2, "0")}`;
      }
    }
    return "";
  };

  const formatLocalDateTime = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  };

  const toDateTimeString = (value, fallbackDate) => {
    if (!value) return undefined;
    const str = String(value).trim();

    if (/^\d{2}:\d{2}$/.test(str)) {
      if (!fallbackDate) return undefined;
      return `${fallbackDate}T${str}:00`;
    }

    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) {
      if (!fallbackDate) return undefined;
      return `${fallbackDate}T${str}`;
    }

    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(str)) {
      return `${str.replace(" ", "T")}:00`;
    }

    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(str)) {
      return str.replace(" ", "T");
    }

    const date = new Date(str);
    if (Number.isNaN(date.getTime())) return undefined;
    return formatLocalDateTime(date);
  };

  const toNullableNumber = (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const toYYYYMMDD = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split("/");
      return `${yyyy}-${mm}-${dd}`;
    }
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const getRowValue = (row, keys) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
        return row[key];
      }
    }
    return "";
  };

  const resolveEmployeeIdFromRow = (row) => {
    const rawEmployeeId = getRowValue(row, [
      "employee_id",
      "employeeid",
      "employee",
    ]);
    if (rawEmployeeId) return Number(rawEmployeeId);

    const email = String(
      getRowValue(row, ["email", "employee_email"]) || "",
    ).toLowerCase();
    if (email) {
      const byEmail = employees.find((emp) => {
        const empEmail =
          emp.email || emp.user_email || emp.userEmail || emp.user?.email || "";
        return String(empEmail).toLowerCase() === email;
      });
      if (byEmail)
        return Number(byEmail.id || byEmail.userId || byEmail.employeeId);
    }

    const name = String(
      getRowValue(row, ["name", "employee_name", "full_name"]) || "",
    ).toLowerCase();
    if (name) {
      const byName = employees.find((emp) => {
        const empName =
          emp.name ||
          emp.fullName ||
          emp.employee_name ||
          emp.user_name ||
          emp.user?.name ||
          "";
        return String(empName).toLowerCase() === name;
      });
      if (byName)
        return Number(byName.id || byName.userId || byName.employeeId);
    }

    return 0;
  };

  const buildIsoDateTime = (date, time) => {
    if (!date || !time) return undefined;
    return `${date}T${time}:00`;
  };

  const handleOpenCsvPicker = () => {
    csvInputRef.current?.click();
  };

  const handleImportCsv = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Vui lòng chọn file CSV");
      return;
    }

    setIsImportingCsv(true);
    try {
      const content = await file.text();
      const rows = parseCsvToRows(content);
      if (!rows.length) {
        toast.error("File CSV không có dữ liệu hợp lệ");
        return;
      }

      let successCount = 0;
      const errors = [];

      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const employeeId = resolveEmployeeIdFromRow(row);
        const workDate = toYYYYMMDD(
          getRowValue(row, ["work_date", "date", "ngay_cong"]),
        );
        const checkInRaw = getRowValue(row, [
          "check_in",
          "checkin",
          "gio_vao",
          "check_in_time",
        ]);
        const checkOutRaw = getRowValue(row, [
          "check_out",
          "checkout",
          "gio_ra",
          "check_out_time",
        ]);
        const checkIn = toDateTimeString(checkInRaw, workDate);
        const checkOut = toDateTimeString(checkOutRaw, workDate);
        const fallbackCheckInTime = toHHMM(
          getRowValue(row, ["check_in", "checkin", "gio_vao"]),
        );
        const fallbackCheckOutTime = toHHMM(
          getRowValue(row, ["check_out", "checkout", "gio_ra"]),
        );
        const workMinutes = toNullableNumber(
          getRowValue(row, ["work_minutes", "workminute", "so_phut_lam"]),
        );
        const overtimeMinutes = toNullableNumber(
          getRowValue(row, ["overtime_minutes", "ot_minutes", "so_phut_ot"]),
        );
        const status = String(
          getRowValue(row, ["status", "trang_thai"]) || "PRESENT",
        ).toUpperCase();
        const note = String(getRowValue(row, ["note", "ghi_chu"]) || "");

        if (!employeeId || !workDate) {
          errors.push(`Dòng ${i + 2}: thiếu employee_id hoặc work_date`);
          continue;
        }

        const payload = normalizePayload({
          employeeId,
          workDate,
          checkIn: checkIn || buildIsoDateTime(workDate, fallbackCheckInTime),
          checkOut:
            checkOut || buildIsoDateTime(workDate, fallbackCheckOutTime),
          workMinutes,
          overtimeMinutes,
          status,
          note,
        });

        try {
          await attendanceAPI.createManualAttendance(payload);
          successCount += 1;
        } catch (rowError) {
          const errorMessage =
            rowError?.response?.data?.message ||
            rowError?.message ||
            "Lỗi không xác định";
          errors.push(`Dòng ${i + 2}: ${errorMessage}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Đã nhập ${successCount} dòng chấm công`);
        fetchAttendance();
      }

      if (errors.length > 0) {
        toast.error(`Có ${errors.length} dòng lỗi khi import CSV`);
        console.error("CSV import errors:", errors);
      }
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast.error("Không thể đọc file CSV");
    } finally {
      setIsImportingCsv(false);
    }
  };

  const getAttendanceDate = (item) => {
    return (
      item.workDate ||
      item.work_date ||
      item.checkIn ||
      item.check_in ||
      item.createdAt ||
      item.created_at
    );
  };

  const getStatusBadge = (status) => {
    const normalized = (status || "").toUpperCase();
    if (["PRESENT", "ON_TIME", "OK"].includes(normalized)) {
      return "bg-emerald-100 text-emerald-700";
    }
    if (["LATE", "DELAY"].includes(normalized)) {
      return "bg-amber-100 text-amber-700";
    }
    if (["ABSENT", "NO_SHOW"].includes(normalized)) {
      return "bg-rose-100 text-rose-700";
    }
    return "bg-slate-100 text-slate-700";
  };

  const filteredAttendance = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return attendance;
    return attendance.filter((item) => {
      const info = getEmployeeInfo(item);
      return (
        info.name.toLowerCase().includes(term) ||
        String(info.id || "").includes(term) ||
        (info.email || "").toLowerCase().includes(term)
      );
    });
  }, [attendance, searchTerm, getEmployeeInfo]);

  const handleOpenModal = (item = null) => {
    if (item) {
      const info = getEmployeeInfo(item);
      setEditingItem(item);
      setFormData({
        employeeId: info.id || "",
        workDate: formatDateInput(getAttendanceDate(item)),
        checkIn: formatTime(
          item.checkIn || item.check_in || item.check_in_time,
        ),
        checkOut: formatTime(
          item.checkOut || item.check_out || item.check_out_time,
        ),
        status: item.status || "PRESENT",
        note: item.note || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        employeeId: "",
        workDate: "",
        checkIn: "",
        checkOut: "",
        status: "PRESENT",
        note: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.employeeId || !formData.workDate) {
      toast.error("Vui lòng chọn nhân viên và ngày điểm danh");
      return;
    }

    const payload = normalizePayload({
      employeeId: Number(formData.employeeId),
      workDate: formData.workDate,
      checkIn: buildIsoDateTime(formData.workDate, formData.checkIn),
      checkOut: buildIsoDateTime(formData.workDate, formData.checkOut),
      status: formData.status,
      note: formData.note,
    });

    try {
      if (editingItem) {
        await attendanceAPI.updateAttendance(editingItem.id, payload);
        toast.success("Cập nhật điểm danh thành công");
      } else {
        await attendanceAPI.createManualAttendance(payload);
        toast.success("Tạo điểm danh thủ công thành công");
      }
      handleCloseModal();
      fetchAttendance();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error(error.message || "Không thể lưu điểm danh");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Điểm Danh</h1>
          <p className="mt-1 text-gray-600">
            Theo dõi check-in/check-out và chỉnh sửa thủ công
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImportCsv}
          />
          <Button
            onClick={handleOpenCsvPicker}
            variant="outline"
            disabled={isImportingCsv}
          >
            <Upload className="mr-2 h-5 w-5" />
            {isImportingCsv ? "Đang nhập CSV..." : "Nhập CSV chấm công"}
          </Button>
          <Button onClick={() => handleOpenModal()} variant="primary">
            <Plus className="mr-2 h-5 w-5" />
            Tạo điểm danh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-panel-strong rounded-2xl p-4">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <User className="h-4 w-4 text-coffee-600" />
            <span>Tổng lượt điểm danh</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {attendance.length}
          </p>
        </div>
        <div className="glass-panel-strong rounded-2xl p-4">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span>Đúng giờ</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {
              attendance.filter((item) =>
                ["PRESENT"].includes(String(item.status || "").toUpperCase()),
              ).length
            }
          </p>
        </div>
        <div className="glass-panel-strong rounded-2xl p-4">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Đi trễ / vắng</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {
              attendance.filter((item) =>
                [
                  "ABSENT",
                  "PAID_LEAVE",
                  "UNPAID_LEAVE",
                  "SICK_LEAVE",
                  "MATERNITY_LEAVE",
                  "HOLIDAY",
                ].includes(String(item.status || "").toUpperCase()),
              ).length
            }
          </p>
        </div>
      </div>

      <div className="glass-panel-strong rounded-2xl p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Calendar className="h-4 w-4 text-coffee-600" />
            <span>Tháng</span>
          </div>
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <Input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="max-w-[200px]"
            />
            <Input
              placeholder="Tìm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel-strong overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-coffee-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Nhân viên</th>
                  <th className="px-5 py-4">Ngày</th>
                  <th className="px-5 py-4">Check-in</th>
                  <th className="px-5 py-4">Check-out</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40 text-sm">
                {filteredAttendance.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length > 0 ? (
                  filteredAttendance.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => {
                    const info = getEmployeeInfo(item);
                    const dateValue = getAttendanceDate(item);
                    const status = item.status || "—";
                    return (
                      <tr key={item.id} className="hover:bg-white/35">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coffee-100 text-coffee-700">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {info.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                #{info.id || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {dateValue ? formatDate(dateValue) : "--"}
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            <Clock className="h-3 w-3" />
                            {formatTime(item.checkIn || item.check_in)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            <Clock className="h-3 w-3" />
                            {formatTime(item.checkOut || item.check_out)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                              status,
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            onClick={() => handleOpenModal(item)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Sửa
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Không có dữ liệu điểm danh
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {!isLoading && Math.ceil(filteredAttendance.length / itemsPerPage) > 1 && (
          <div className="p-4 border-t border-white/20">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAttendance.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 py-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40"
                onClick={handleCloseModal}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative z-50 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl"
              >
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {editingItem
                        ? "Cập nhật điểm danh"
                        : "Tạo điểm danh thủ công"}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Nhân viên *
                      </label>
                      <select
                        value={formData.employeeId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employeeId: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-100"
                        required
                      >
                        <option value="">-- Chọn nhân viên --</option>
                        {employees.map((emp) => {
                          const value = emp.id ||"";
                          return (
                            <option
                              key={`${value}_${emp.id || ""}`}
                              value={value}
                            >
                              {getEmployeeOptionLabel(emp)}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        label="Ngày *"
                        type="date"
                        value={formData.workDate}
                        onChange={(e) =>
                          setFormData({ ...formData, workDate: e.target.value })
                        }
                        required
                      />
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Trạng thái *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-100"
                          required
                        >
                          <option value="PRESENT">PRESENT</option>
                          <option value="ABSENT">ABSENT</option>
                          <option value="PAID_LEAVE">PAID_LEAVE</option>
                          <option value="UNPAID_LEAVE">UNPAID_LEAVE</option>
                          <option value="SICK_LEAVE">SICK_LEAVE</option>
                          <option value="MATERNITY_LEAVE">
                            MATERNITY_LEAVE
                          </option>
                          <option value="HOLIDAY">HOLIDAY</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        label="Check-in"
                        type="time"
                        value={formData.checkIn}
                        onChange={(e) =>
                          setFormData({ ...formData, checkIn: e.target.value })
                        }
                      />
                      <Input
                        label="Check-out"
                        type="time"
                        value={formData.checkOut}
                        onChange={(e) =>
                          setFormData({ ...formData, checkOut: e.target.value })
                        }
                      />
                    </div>

                    <Input
                      label="Ghi chú"
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      placeholder="Ghi chú thêm nếu cần"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t bg-slate-50 px-6 py-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" variant="primary">
                      {editingItem ? "Cập nhật" : "Tạo mới"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAttendancePage;
