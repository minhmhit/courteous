import { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle, XCircle, Send } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { leaveAPI, resignationAPI, employeeAPI } from "../../services";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const AdminLeavePage = () => {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const roleId = user?.roleId || user?.role_id || user?.role;
  const userId = user?.id || user?.userId || user?.user_id;
  const isHR = roleId === 1 || roleId === 5;

  const [requests, setRequests] = useState([]);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [isEmployeeProfileLoading, setIsEmployeeProfileLoading] = useState(true);

  const LEAVE_TYPE_MAP = {
    ANNUAL: 1,
    SICK: 2,
    MATERNITY: 3,
    UNPAID: 4,
    OTHER: 5,
  };

  const REQUEST_TYPE_MAP = {
    ANNUAL: "ANNUAL_LEAVE",
    SICK: "SICK_LEAVE",
    MATERNITY: "MATERNITY_LEAVE",
    UNPAID: "UNPAID_LEAVE",
    OTHER: "OTHER",
  };

  const [formData, setFormData] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diffTime = end.getTime() - start.getTime();
    return diffTime / (1000 * 60 * 60 * 24) + 1;
  };

  const fetchRequests = async () => {
    try {
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
      if (isHR) {
        const [leaveRes, resignRes] = await Promise.all([
          leaveAPI.getPendingLeaveRequests().catch(() => []),
          resignationAPI.getPendingResignations().catch(() => []),
        ]);
        const leaveList = toArray(leaveRes);
        const resignList = toArray(resignRes);
        const normalized = [
          ...leaveList.map((item) => ({ ...item, requestType: "LEAVE" })),
          ...resignList.map((item) => ({ ...item, requestType: "RESIGNATION" })),
        ];
        setRequests(normalized);
      } else {
        const [leaveRes, resignRes] = await Promise.all([
          leaveAPI.getMyLeaveRequests().catch(() => []),
          resignationAPI.getMyResignations().catch(() => []),
        ]);
        const leaveList = toArray(leaveRes);
        const resignList = toArray(resignRes);
        const normalized = [
          ...leaveList.map((item) => ({ ...item, requestType: "LEAVE" })),
          ...resignList.map((item) => ({ ...item, requestType: "RESIGNATION" })),
        ];
        setRequests(normalized);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error("Không thể tải danh sách đơn");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsEmployeeProfileLoading(true);
      try {
        const res = await employeeAPI.getMyProfile();
        setEmployeeProfile(res?.data || res);
      } catch (error) {
        setEmployeeProfile(null);
      } finally {
        setIsEmployeeProfileLoading(false);
      }
    };

    fetchProfile();
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHR]);

  const myRequests = useMemo(() => {
    return requests.filter((req) => {
      const employeeId =
        req.employeeId || req.employee_id || req.employee?.id || req.userId;
      return employeeId === userId;
    });
  }, [requests, userId]);

  const isEligibleForLeave =
    !isEmployeeProfileLoading && (isHR || !!employeeProfile);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      toast.error("Vui lòng chọn thời gian nghỉ");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error("Ngày không hợp lệ");
      return;
    }
    if (end < start) {
      toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
      return;
    }

    try {
      if (!isEligibleForLeave) {
        toast.error(
          "Tài khoản chưa có hồ sơ nhân viên. Liên hệ HRM để tạo hồ sơ trước khi gửi đơn nghỉ phép.",
        );
        return;
      }

      if (formData.type === "RESIGNATION") {
        await resignationAPI.createResignation({
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
        });
      } else {
        const leaveTypeId = LEAVE_TYPE_MAP[formData.type] || LEAVE_TYPE_MAP.ANNUAL;
        const requestType =
          REQUEST_TYPE_MAP[formData.type] || REQUEST_TYPE_MAP.ANNUAL;
        const totalDays = calculateTotalDays(formData.startDate, formData.endDate);

        await leaveAPI.createLeaveRequest({
          leaveTypeId,
          requestType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalDays,
          reason: formData.reason,
        });
      }

      setFormData({ type: "ANNUAL", startDate: "", endDate: "", reason: "" });
      toast.success("Đã gửi đơn");
      fetchRequests();
    } catch (error) {
      console.error("Error creating request:", error);
      const msg =
        error.response?.data?.errors?.[0]?.msg ||
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi đơn";
      toast.error(msg);
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

  const renderStatus = (status) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        STATUS_COLORS[status] || STATUS_COLORS.PENDING
      }`}
    >
      {status}
    </span>
  );

  const listData = isHR ? requests : myRequests;

  const getRequestMeta = (req) => {
    const employeeName =
      req.employeeName ||
      req.employee_name ||
      req.employee?.userName ||
      req.employee?.username ||
      req.employee?.name ||
      req.employee?.fullName ||
      req.userName ||
      req.username ||
      req.user?.name ||
      req.user?.fullName ||
      req.name ||
      "N/A";
    const requestTypeRaw =
      req.leaveType || req.type || req.requestType || req.request_type;
    const requestType =
      String(requestTypeRaw || "")
        .toUpperCase()
        .trim() || "LEAVE";
    const startDate = req.startDate || req.start_date || "--";
    const endDate = req.endDate || req.end_date || "--";
    const statusRaw =
      req.status ||
      req.requestStatus ||
      req.approvalStatus ||
      req.approval_status ||
      "PENDING";
    const status = String(statusRaw).toUpperCase();
    return { employeeName, requestType, startDate, endDate, status };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Đơn nghỉ phép</h1>
        <p className="text-gray-600 mt-1">
          Gửi và theo dõi yêu cầu nghỉ phép, nghỉ ốm, thai sản, nghỉ việc
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tạo đơn nghỉ phép
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại đơn
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
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
              required
            />
            <Input
              label="Lý do"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Mô tả lý do nghỉ"
            />
            <Button type="submit" variant="primary">
              <Send className="w-4 h-4 mr-2" />
              Gửi đơn
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isHR ? "Danh sách đơn nghỉ" : "Đơn của tôi"}
            </h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nhân viên
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  {isHR && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Xử lý
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
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
                      <tr key={rowId}>
                        <td className="px-4 py-3 text-gray-900">
                          {meta.employeeName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {meta.requestType}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {meta.startDate} - {meta.endDate}
                        </td>
                        <td className="px-4 py-3">
                          {renderStatus(meta.status)}
                        </td>
                        {isHR && (
                          <td className="px-4 py-3 text-right space-x-2">
                            <Button
                              onClick={() => updateStatus(req, "APPROVED")}
                              variant="outline"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              onClick={() => updateStatus(req, "REJECTED")}
                              variant="outline"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Từ chối
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={isHR ? 5 : 4}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Chưa có đơn nghỉ nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeavePage;
