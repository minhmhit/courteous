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

  // Self: điểm danh cá nhân (ưu tiên /attendance/me theo month/year)
  getMyAttendance: async (params = {}) => {
    const { month, year, userId, page = 1, limit = 200 } = params;

    try {
      return await axiosInstance.get("/attendance/me", {
        params: {
          month,
          year,
        },
      });
    } catch (error) {
      return await axiosInstance.get("/attendance", {
        params: {
          page,
          limit,
          month,
          year,
          ...(userId ? { userId } : {}),
        },
      });
    }
  },
};

export default attendanceAPI;
