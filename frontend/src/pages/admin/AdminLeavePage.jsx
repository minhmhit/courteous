import { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle, Send, XCircle } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import {
  employeeAPI,
  leaveAPI,
  leaveTypeAPI,
  resignationAPI,
} from "../../services";
import { formatDate } from "../../utils/formatDate";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const STATUS_LABELS = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

const LEAVE_CODE_ALIASES = {
  ANNUAL: "ANNUAL_LEAVE",
  ANNUAL_LEAVE: "ANNUAL_LEAVE",
  LEAVE: "ANNUAL_LEAVE",
  SICK: "SICK_LEAVE",
  SICK_LEAVE: "SICK_LEAVE",
  MATERNITY: "MATERNITY_LEAVE",
  MATERNITY_LEAVE: "MATERNITY_LEAVE",
  UNPAID: "UNPAID_LEAVE",
  UNPAID_LEAVE: "UNPAID_LEAVE",
  OTHER: "OTHER",
};

const DEFAULT_TYPE_OPTIONS = [
  { value: "ANNUAL_LEAVE", label: "Nghỉ phép năm" },
  { value: "SICK_LEAVE", label: "Nghỉ ốm" },
  { value: "MATERNITY_LEAVE", label: "Nghỉ thai sản" },
  { value: "RESIGNATION", label: "Nghỉ việc" },
];

const toArray = (res) => {
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.leaveRequests)) return data.leaveRequests;
  if (Array.isArray(data?.resignationRequests)) return data.resignationRequests;
  if (Array.isArray(data?.payrollPeriods)) return data.payrollPeriods;
  return [];
};

const normalizeLeaveCode = (value) =>
  LEAVE_CODE_ALIASES[String(value || "").trim().toUpperCase()] || null;

const normalizeStatus = (req) =>
  String(
    req?.status ||
      req?.requestStatus ||
      req?.approvalStatus ||
      req?.approval_status ||
      "PENDING",
  ).toUpperCase();

const normalizeStartDate = (req) =>
  req?.startDate || req?.start_date || req?.desiredLastWorkingDate || req?.desired_last_working_date;

const normalizeEndDate = (req) =>
  req?.endDate ||
  req?.end_date ||
  req?.startDate ||
  req?.start_date ||
  req?.desiredLastWorkingDate ||
  req?.desired_last_working_date;

const formatDisplayDate = (value) => {
  if (!value || value === "--") return "--";

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
  }

  return formatDate(value);
};

const formatDisplayRange = (startDate, endDate) => {
  const start = formatDisplayDate(startDate);
  const end = formatDisplayDate(endDate);
  if (start === "--" && end === "--") return "--";
  if (start === end) return start;
  return `${start} - ${end}`;
};

const calculateTotalDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
};

const AdminLeavePage = () => {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const toast = useToastStore();
  const roleId = user?.roleId || user?.role_id || user?.role;
  const isHR = roleId === 1 || roleId === 5;

  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "ANNUAL_LEAVE",
    startDate: "",
    endDate: "",
    reason: "",
    attachmentMethod: "LATER",
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const leaveTypeMap = useMemo(() => {
    const map = new Map();
    leaveTypes.forEach((item) => {
      const code = normalizeLeaveCode(item.code);
      if (code) {
        map.set(code, item);
      }
    });
    return map;
  }, [leaveTypes]);

  const typeOptions = useMemo(() => {
    if (!leaveTypes.length) return DEFAULT_TYPE_OPTIONS;

    const options = leaveTypes
      .map((item) => {
        const code = normalizeLeaveCode(item.code);
        if (!code) return null;
        return {
          value: code,
          label: item.name || code,
        };
      })
      .filter(Boolean);

    return [...options, { value: "RESIGNATION", label: "Nghỉ việc" }];
  }, [leaveTypes]);

  const myRequests = useMemo(() => {
    const employeeId = employeeProfile?.id;
    if (!employeeId) return [];

    return requests.filter((req) => {
      const reqEmployeeId = req.employeeId || req.employee_id || req.employee?.id;
      return Number(reqEmployeeId) === Number(employeeId);
    });
  }, [employeeProfile, requests]);

  const isEligibleForLeave = !isLoadingProfile && (isHR || !!employeeProfile);

  const fetchLeaveTypes = async () => {
    try {
      const res = await leaveTypeAPI.getAllLeaveTypes({ isActive: true });
      const list = toArray(res);
      setLeaveTypes(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching leave types:", error);
      setLeaveTypes([]);
    }
  };

  const fetchRequests = async () => {
    try {
      if (isHR) {
        const [leaveRes, resignationRes] = await Promise.all([
          leaveAPI.getPendingLeaveRequests().catch(() => []),
          resignationAPI.getPendingResignations().catch(() => []),
        ]);

        setRequests([
          ...toArray(leaveRes).map((item) => ({ ...item, requestKind: "LEAVE" })),
          ...toArray(resignationRes).map((item) => ({
            ...item,
            requestKind: "RESIGNATION",
          })),
        ]);
        return;
      }

      const [leaveRes, resignationRes] = await Promise.all([
        leaveAPI.getMyLeaveRequests().catch(() => []),
        resignationAPI.getMyResignations().catch(() => []),
      ]);

      setRequests([
        ...toArray(leaveRes).map((item) => ({ ...item, requestKind: "LEAVE" })),
        ...toArray(resignationRes).map((item) => ({
          ...item,
          requestKind: "RESIGNATION",
        })),
      ]);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Không thể tải danh sách đơn");
    }
  };

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user) return;

    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const res = await employeeAPI.getMyProfile();
        setEmployeeProfile(res?.data || res);
      } catch {
        setEmployeeProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
    fetchLeaveTypes();
    fetchRequests();
  }, [isAuthenticated, isHR, isInitialized, user]);

  const hasDateOverlap = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }

    return myRequests.some((req) => {
      if (req.requestKind === "RESIGNATION") return false;
      if (!["PENDING", "APPROVED"].includes(normalizeStatus(req))) return false;

      const reqStart = new Date(normalizeStartDate(req));
      const reqEnd = new Date(normalizeEndDate(req));
      if (Number.isNaN(reqStart.getTime()) || Number.isNaN(reqEnd.getTime())) {
        return false;
      }

      return start <= reqEnd && end >= reqStart;
    });
  };

  const resetForm = () => {
    setFormData({
      type: "ANNUAL_LEAVE",
      startDate: "",
      endDate: "",
      reason: "",
      attachmentMethod: "LATER",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const isResignation = formData.type === "RESIGNATION";
    const effectiveEndDate = isResignation
      ? formData.endDate || formData.startDate
      : formData.endDate;

    if (!formData.startDate || !effectiveEndDate) {
      toast.error("Vui lòng chọn thời gian nghỉ");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(effectiveEndDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error("Ngày không hợp lệ");
      return;
    }
    if (end < start) {
      toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
      return;
    }

    if (!isEligibleForLeave) {
      toast.error("Tài khoản chưa có hồ sơ nhân viên");
      return;
    }

    if (!isResignation && hasDateOverlap(formData.startDate, effectiveEndDate)) {
      toast.error("Khoảng thời gian này bị trùng với đơn nghỉ khác");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isResignation) {
        await resignationAPI.createResignation({
          desiredLastWorkingDate: effectiveEndDate,
          reason: formData.reason,
        });
      } else {
        const leaveType = leaveTypeMap.get(formData.type);
        if (!leaveType) {
          toast.error("Không tìm thấy cấu hình loại nghỉ");
          return;
        }

        const requiresAttachment =
          leaveType.requiresAttachment || leaveType.requires_attachment;
        const reasonWithAttachmentNote = requiresAttachment
          ? `${formData.reason || ""}${
              formData.reason?.trim() ? "\n" : ""
            }[Chứng từ: ${
              formData.attachmentMethod === "DIRECT"
                ? "Nộp trực tiếp"
                : "Bổ sung sau"
            }]`
          : formData.reason;

        await leaveAPI.createLeaveRequest({
          leaveTypeId: leaveType.id,
          requestType: formData.type,
          startDate: formData.startDate,
          endDate: effectiveEndDate,
          totalDays: calculateTotalDays(formData.startDate, effectiveEndDate),
          reason: reasonWithAttachmentNote,
        });
      }

      resetForm();
      toast.success("Đã gửi đơn");
      fetchRequests();
    } catch (error) {
      console.error("Error creating request:", error);
      const msg =
        error?.errors?.[0]?.msg ||
        error?.error ||
        error?.message ||
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Không thể gửi đơn";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (req, status) => {
    try {
      const requestId =
        req?.id ||
        req?.requestId ||
        req?.leaveRequestId ||
        req?.resignationRequestId;
      if (!requestId) {
        toast.error("Không tìm thấy mã đơn");
        return;
      }

      const rejectedReason =
        status === "REJECTED"
          ? window.prompt("Nhập lý do từ chối:", req?.rejectedReason || "")
          : null;

      if (status === "REJECTED" && !rejectedReason?.trim()) {
        toast.error("Lý do từ chối là bắt buộc");
        return;
      }

      if (req.requestKind === "RESIGNATION") {
        if (status === "APPROVED") {
          await resignationAPI.approveResignation(requestId);
        } else {
          await resignationAPI.rejectResignation(requestId, {
            rejectedReason: rejectedReason.trim(),
          });
        }
      } else if (status === "APPROVED") {
        await leaveAPI.approveLeaveRequest(requestId);
      } else {
        await leaveAPI.rejectLeaveRequest(requestId, {
          rejectedReason: rejectedReason.trim(),
        });
      }

      toast.success("Đã cập nhật trạng thái");
      fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      const msg =
        error?.errors?.[0]?.msg ||
        error?.error ||
        error?.message ||
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Không thể cập nhật trạng thái";
      toast.error(msg);
    }
  };

  const renderStatus = (status) => {
    const normalized = String(status || "PENDING").toUpperCase();
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          STATUS_COLORS[normalized] || STATUS_COLORS.PENDING
        }`}
      >
        {STATUS_LABELS[normalized] || normalized}
      </span>
    );
  };

  const listData = isHR ? requests : myRequests;

  const getRequestMeta = (req) => {
    const isResignation = req?.requestKind === "RESIGNATION";
    const employeeName =
      req?.employeeName ||
      req?.employee_name ||
      req?.employee?.name ||
      req?.employee?.fullName ||
      req?.userName ||
      req?.user?.name ||
      req?.name ||
      "N/A";

    const leaveCode = normalizeLeaveCode(
      req?.leaveTypeCode || req?.leave_type_code || req?.requestType || req?.request_type,
    );
    const leaveTypeLabel =
      req?.leaveTypeName ||
      req?.leave_type_name ||
      leaveTypeMap.get(leaveCode)?.name ||
      leaveCode ||
      "Nghỉ phép";

    const startDate = normalizeStartDate(req) || "--";
    const endDate = normalizeEndDate(req) || "--";

    return {
      employeeName,
      requestKind: isResignation ? "RESIGNATION" : "LEAVE",
      requestTypeLabel: isResignation ? "Nghỉ việc" : leaveTypeLabel,
      startDate,
      endDate,
      detailRange: formatDisplayRange(startDate, endDate),
      status: normalizeStatus(req),
      reason: req?.reason || "Không có lý do",
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Đơn nghỉ phép</h1>
        <p className="mt-1 text-gray-600">
          Gửi và theo dõi yêu cầu nghỉ phép, nghỉ ốm, thai sản, nghỉ việc
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Tạo đơn nghỉ phép
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Loại đơn
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value,
                    attachmentMethod: "LATER",
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Từ ngày"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
              required
            />

            <Input
              label="Đến ngày"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              required={formData.type !== "RESIGNATION"}
            />

            <Input
              label="Lý do"
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Mô tả lý do nghỉ"
            />

            {false &&
              (
                leaveTypeMap.get(formData.type)?.requiresAttachment ||
                leaveTypeMap.get(formData.type)?.requires_attachment
              ) && (
                <Input
                  label="Đính kèm chứng từ"
                  type="url"
                  value={formData.attachmentUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      attachmentUrl: e.target.value,
                    }))
                  }
                  placeholder="Dán URL chứng từ liên quan"
                />
              )}

            {formData.type !== "RESIGNATION" &&
              (
                leaveTypeMap.get(formData.type)?.requiresAttachment ||
                leaveTypeMap.get(formData.type)?.requires_attachment
              ) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-900">
                    Loại nghỉ này cần chứng từ
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Bạn có thể chọn cách bổ sung chứng từ sau khi gửi đơn.
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="attachmentMethod"
                        value="LATER"
                        checked={formData.attachmentMethod === "LATER"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            attachmentMethod: e.target.value,
                          }))
                        }
                      />
                      Nộp sau
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="attachmentMethod"
                        value="DIRECT"
                        checked={formData.attachmentMethod === "DIRECT"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            attachmentMethod: e.target.value,
                          }))
                        }
                      />
                      Nộp trực tiếp
                    </label>
                  </div>
                </div>
              )}

            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              Gửi đơn
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isHR ? "Danh sách đơn nghỉ" : "Đơn của tôi"}
            </h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {listData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length > 0 ? (
              listData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((req) => {
                const meta = getRequestMeta(req);
                const rowId =
                  req.id ||
                  req.requestId ||
                  req.leaveRequestId ||
                  req.resignationRequestId ||
                  `${meta.requestKind}-${meta.startDate}-${meta.endDate}`;

                return (
                  <div
                    key={rowId}
                    className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-coffee-50/40 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {meta.employeeName}
                          </h3>
                          {renderStatus(meta.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {isHR ? "Nhân viên gửi đơn" : "Yêu cầu nghỉ của bạn"}
                        </p>
                      </div>

                      {isHR && meta.status === "PENDING" && (
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => updateStatus(req, "APPROVED")}
                            size="sm"
                            className="border-0 bg-emerald-600 px-4 py-2 text-white shadow-md hover:bg-emerald-700 hover:shadow-lg"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Duyệt
                          </Button>
                          <Button
                            onClick={() => updateStatus(req, "REJECTED")}
                            variant="danger"
                            size="sm"
                            className="px-4 py-2"
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-600">
                        Chi tiết
                      </p>

                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-medium uppercase text-gray-400">
                            Lý do
                          </p>
                          <p className="mt-1 text-sm text-gray-700">{meta.reason}</p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase text-gray-400">
                            Loại
                          </p>
                          <p className="mt-1 text-sm font-medium text-gray-800">
                            {meta.requestTypeLabel}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase text-gray-400">
                            Thời gian
                          </p>
                          <p className="mt-1 text-sm text-gray-700">
                            {meta.detailRange}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center text-gray-500">
                Chưa có đơn nghỉ nào
              </div>
            )}
          </div>
          
          {Math.ceil(listData.length / itemsPerPage) > 1 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(listData.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeavePage;

