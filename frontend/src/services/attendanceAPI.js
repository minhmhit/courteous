import axiosInstance from "./axiosConfig";

const attendanceAPI = {
  // Admin: danh sách điểm danh (có thể filter theo tháng, nhân viên)
  getAllAttendance: async (page = 1, limit = 200, params = {}) => {
    return await axiosInstance.get("/attendance", {
      params: { page, limit, ...params },
    });
  },

  // Admin: tạo điểm danh thủ công
  createManualAttendance: async (payload) => {
    return await axiosInstance.post("/attendance/manual", payload);
  },

  // Admin: cập nhật điểm danh
  updateAttendance: async (attendanceId, payload) => {
    return await axiosInstance.patch(`/attendance/${attendanceId}`, payload);
  },
};

export default attendanceAPI;
