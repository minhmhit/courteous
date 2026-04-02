import { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle, Send, XCircle } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { employeeAPI, leaveAPI, resignationAPI } from "../../services";
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

const REQUEST_TYPE_LABELS = {
  LEAVE: "Nghỉ phép",
  ANNUAL_LEAVE: "Nghỉ phép năm",
  ANNUAL: "Nghỉ phép năm",
  SICK_LEAVE: "Nghỉ ốm",
  SICK: "Nghỉ ốm",
  MATERNITY_LEAVE: "Nghỉ thai sản",
  MATERNITY: "Nghỉ thai sản",
  UNPAID_LEAVE: "Nghỉ không lương",
  UNPAID: "Nghỉ không lương",
  RESIGNATION: "Nghỉ việc",
  OTHER: "Khác",
};

const LEAVE_TYPE_MAP = {
  ANNUAL: 1,
  SICK: 2,
  MATERNITY: 3,
  UNPAID: 4,
  OTHER: 5,
};

const REQUEST_TYPE_MAP = {
  ANNUAL: "ANNUAL_LEAVE",
  SICK: "ANNUAL_LEAVE",
  MATERNITY: "ANNUAL_LEAVE",
  UNPAID: "ANNUAL_LEAVE",
  OTHER: "OTHER",
};

const toArray = (res) => {
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.leaveRequests)) return data.leaveRequests;
  if (Array.isArray(data?.resignationRequests)) return data.resignationRequests;
  return [];
};

const normalizeStatus = (req) =>
  String(
    req?.status ||
      req?.requestStatus ||
      req?.approvalStatus ||
      req?.approval_status ||
      "PENDING"
  ).toUpperCase();

const normalizeStartDate = (req) => req?.startDate || req?.start_date;

const normalizeEndDate = (req) =>
  req?.endDate || req?.end_date || req?.startDate || req?.start_date;

const AdminLeavePage = () => {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const toast = useToastStore();
  const roleId = user?.roleId || user?.role_id || user?.role;
  const userId = user?.id || user?.userId || user?.user_id;
  const isHR = roleId === 1 || roleId === 5;

  const [requests, setRequests] = useState([]);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [isEmployeeProfileLoading, setIsEmployeeProfileLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
    attachmentUrl: "",
  });

  const myRequests = useMemo(() => {
    return requests.filter((req) => {
      if (!req) return false;
      const employeeId =
        req.employeeId || req.employee_id || req.employee?.id || req.userId;
      return employeeId === userId;
    });
  }, [requests, userId]);

  const isEligibleForLeave =
    !isEmployeeProfileLoading && (isHR || !!employeeProfile);

  const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diffTime = end.getTime() - start.getTime();
    return diffTime / (1000 * 60 * 60 * 24) + 1;
  };

  const formatDisplayDate = (value) => {
    if (!value || value === "--") return "--";

    if (typeof value === "string") {
      const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateMatch) {
        return `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
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

  const hasDateOverlap = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }

    return myRequests.some((req) => {
      if (!["PENDING", "APPROVED"].includes(normalizeStatus(req))) {
        return false;
      }

      if (String(req?.requestType || "").toUpperCase() === "RESIGNATION") {
        return false;
      }

      const reqStart = new Date(normalizeStartDate(req));
      const reqEnd = new Date(normalizeEndDate(req));

      if (Number.isNaN(reqStart.getTime()) || Number.isNaN(reqEnd.getTime())) {
        return false;
      }

      return start <= reqEnd && end >= reqStart;
    });
  };

  const fetchRequests = async () => {
    try {
      if (isHR) {
        const [leaveRes, resignRes] = await Promise.all([
          leaveAPI.getPendingLeaveRequests().catch(() => []),
          resignationAPI.getPendingResignations().catch(() => []),
        ]);

        setRequests([
          ...toArray(leaveRes).map((item) => ({ ...item, requestType: "LEAVE" })),
          ...toArray(resignRes).map((item) => ({
            ...item,
            requestType: "RESIGNATION",
          })),
        ]);
        return;
      }

      const [leaveRes, resignRes] = await Promise.all([
        leaveAPI.getMyLeaveRequests().catch(() => []),
        resignationAPI.getMyResignations().catch(() => []),
      ]);

      setRequests([
        ...toArray(leaveRes).map((item) => ({ ...item, requestType: "LEAVE" })),
        ...toArray(resignRes).map((item) => ({
          ...item,
          requestType: "RESIGNATION",
        })),
      ]);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error("Không thể tải danh sách đơn");
    }
  };

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user) {
      return;
    }

    const fetchProfile = async () => {
      setIsEmployeeProfileLoading(true);
      try {
        const res = await employeeAPI.getMyProfile();
        setEmployeeProfile(res?.data || res);
      } catch {
        setEmployeeProfile(null);
      } finally {
        setIsEmployeeProfileLoading(false);
      }
    };

    fetchProfile();
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHR, isAuthenticated, isInitialized, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const requiresAttachment =
      formData.type === "SICK" || formData.type === "MATERNITY";
    const effectiveEndDate =
      formData.type === "RESIGNATION"
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

    if (formData.type !== "RESIGNATION" && hasDateOverlap(formData.startDate, effectiveEndDate)) {
      toast.error(
        "Khoảng thời gian này bị trùng với một đơn nghỉ đang chờ duyệt hoặc đã duyệt."
      );
      return;
    }

    if (!isEligibleForLeave) {
      toast.error(
        "Tài khoản chưa có hồ sơ nhân viên. Liên hệ HRM để tạo hồ sơ trước khi gửi đơn nghỉ phép."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (formData.type === "RESIGNATION") {
        await resignationAPI.createResignation({
          desiredLastWorkingDate: effectiveEndDate,
          reason: formData.reason,
        });
      } else {
        if (requiresAttachment && !formData.attachmentUrl.trim()) {
          toast.error("Nghỉ ốm và nghỉ thai sản cần đính kèm chứng từ");
          return;
        }

        const leaveTypeId = LEAVE_TYPE_MAP[formData.type] || LEAVE_TYPE_MAP.ANNUAL;
        const requestType =
          REQUEST_TYPE_MAP[formData.type] || REQUEST_TYPE_MAP.ANNUAL;
        const totalDays = calculateTotalDays(formData.startDate, effectiveEndDate);

        await leaveAPI.createLeaveRequest({
          leaveTypeId,
          requestType,
          startDate: formData.startDate,
          endDate: effectiveEndDate,
          totalDays,
          reason: formData.reason,
          attachmentUrl: formData.attachmentUrl.trim() || undefined,
        });
      }

      setFormData({
        type: "ANNUAL",
        startDate: "",
        endDate: "",
        reason: "",
        attachmentUrl: "",
      });

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
        "Khoảng thời gian nghỉ bị xung đột với đơn khác hoặc dữ liệu hiện tại không được backend chấp nhận.";
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

      if (req.requestType === "RESIGNATION") {
        if (status === "APPROVED") {
          await resignationAPI.approveResignation(requestId);
        } else {
          await resignationAPI.rejectResignation(requestId);
        }
      } else if (status === "APPROVED") {
        await leaveAPI.approveLeaveRequest(requestId);
      } else {
        await leaveAPI.rejectLeaveRequest(requestId);
      }

      toast.success("Đã cập nhật trạng thái");
      fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const renderStatus = (status) => {
    const normalizedStatus = String(status || "PENDING").toUpperCase();

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          STATUS_COLORS[normalizedStatus] || STATUS_COLORS.PENDING
        }`}
      >
        {STATUS_LABELS[normalizedStatus] || normalizedStatus}
      </span>
    );
  };

  const listData = isHR ? requests : myRequests;

  const getRequestMeta = (req) => {
    if (!req) {
      return {
        employeeName: "N/A",
        requestType: "LEAVE",
        requestTypeLabel: REQUEST_TYPE_LABELS.LEAVE,
        startDate: "--",
        endDate: "--",
        detailRange: "--",
        status: "PENDING",
        reason: "Không có lý do",
      };
    }

    const employeeName =
      req.employeeName ||
      req.employee_name ||
      req.employee?.employeeName ||
      req.employee?.employee_name ||
      req.employee?.name ||
      req.employee?.fullName ||
      req.employee?.user?.name ||
      req.employee?.user?.fullName ||
      req.employee?.userName ||
      req.employee?.username ||
      req.userName ||
      req.username ||
      req.user?.name ||
      req.user?.fullName ||
      req.name ||
      "N/A";

    const requestTypeRaw =
      req.leaveType ||
      req.type ||
      req.requestType ||
      req.request_type ||
      req.leaveTypeName;
    const requestType =
      String(requestTypeRaw || "").toUpperCase().trim() || "LEAVE";
    const startDate = normalizeStartDate(req) || "--";
    const endDate = normalizeEndDate(req) || "--";
    const status = normalizeStatus(req);
    const reason =
      req.reason ||
      req.leaveReason ||
      req.leave_reason ||
      req.resignationReason ||
      req.resignation_reason ||
      req.note ||
      req.notes ||
      "Không có lý do";

    return {
      employeeName,
      requestType,
      requestTypeLabel: REQUEST_TYPE_LABELS[requestType] || requestType,
      startDate,
      endDate,
      detailRange: formatDisplayRange(startDate, endDate),
      status,
      reason,
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
                  setFormData({
                    ...formData,
                    type: e.target.value,
                    attachmentUrl: "",
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="ANNUAL">Nghỉ phép năm</option>
                <option value="SICK">Nghỉ ốm</option>
                <option value="MATERNITY">Nghỉ thai sản</option>
                <option value="RESIGNATION">Nghỉ việc</option>
              </select>
            </div>

            <Input
              label="Từ ngày"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />

            <Input
              label="Đến ngày"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required={formData.type !== "RESIGNATION"}
            />

            <Input
              label="Lý do"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Mô tả lý do nghỉ"
            />

            {(formData.type === "SICK" || formData.type === "MATERNITY") && (
              <Input
                label="Đính kèm chứng từ"
                type="url"
                value={formData.attachmentUrl}
                onChange={(e) =>
                  setFormData({ ...formData, attachmentUrl: e.target.value })
                }
                placeholder="Dán URL giấy khám hoặc xác nhận liên quan"
                required
              />
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
            {listData.length > 0 ? (
              listData.map((req) => {
                const meta = getRequestMeta(req);
                const rowId =
                  req.id ||
                  req.requestId ||
                  req.leaveRequestId ||
                  req.resignationRequestId ||
                  `${meta.requestType}-${meta.startDate}-${meta.endDate}`;

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

                      {isHR && (
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
                          <p className="mt-1 text-sm text-gray-700">
                            {meta.reason}
                          </p>
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
        </div>
      </div>
    </div>
  );
};

export default AdminLeavePage;
