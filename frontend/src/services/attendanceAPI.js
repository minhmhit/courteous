import axiosInstance from "./axiosConfig";

const attendanceAPI = {
  getMyAttendance: async (params = {}) => {
    return await axiosInstance.get("/attendance/me", { params });
  },

  checkIn: async () => {
    return await axiosInstance.post("/attendance/check-in");
  },

  checkOut: async () => {
    return await axiosInstance.post("/attendance/check-out");
  },

  getAllAttendance: async (page = 1, limit = 200, params = {}) => {
    return await axiosInstance.get("/attendance", {
      params: { page, limit, ...params },
    });
  },

  createManualAttendance: async (payload) => {
    return await axiosInstance.post("/attendance/manual", payload);
  },

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
