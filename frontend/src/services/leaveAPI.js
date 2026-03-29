import axiosInstance from "./axiosConfig";

const leaveAPI = {
  // Self: danh sách đơn nghỉ của mình
  getMyLeaveRequests: async () => {
    return await axiosInstance.get("/leave-requests/me");
  },

  // Self: tạo đơn nghỉ
  createLeaveRequest: async (payload) => {
    return await axiosInstance.post("/leave-requests", payload);
  },

  // Self: hủy đơn (PENDING)
  cancelLeaveRequest: async (requestId) => {
    return await axiosInstance.patch(`/leave-requests/${requestId}/cancel`);
  },

  // HR/Admin: danh sách chờ duyệt
  getPendingLeaveRequests: async () => {
    return await axiosInstance.get("/leave-requests/pending");
  },

  // HR/Admin: duyệt
  approveLeaveRequest: async (requestId) => {
    return await axiosInstance.patch(`/leave-requests/${requestId}/approve`);
  },

  // HR/Admin: từ chối
  rejectLeaveRequest: async (requestId, payload) => {
    return await axiosInstance.patch(`/leave-requests/${requestId}/reject`, payload);
  },
};

export default leaveAPI;
