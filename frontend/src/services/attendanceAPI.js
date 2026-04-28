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
};

export default attendanceAPI;
