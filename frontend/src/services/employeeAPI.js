import axiosInstance from "./axiosConfig";

const employeeAPI = {
  // Admin: danh s?ch nh?n vi?n
  getAllEmployees: async (params = {}) => {
    return await axiosInstance.get("/employees", { params });
  },

  // Admin: chi ti?t nh?n vi?n
  getEmployeeById: async (employeeId) => {
    return await axiosInstance.get(`/employees/${employeeId}`);
  },

  // Self: profile
  getMyProfile: async () => {
    return await axiosInstance.get("/employees/me");
  },

  updateMyProfile: async (payload) => {
    return await axiosInstance.patch("/employees/me", payload);
  },

  // Admin/HR: t?o nh?n vi?n
  createEmployee: async (payload) => {
    try {
      return await axiosInstance.post("/employees", payload);
    } catch (error) {
      if (error?.response?.status === 404) {
        return await axiosInstance.post("/admin/users", payload);
      }
      throw error;
    }
  },

  // Admin/HR: c?p nh?t nh?n vi?n
  updateEmployee: async (employeeId, payload) => {
    try {
      return await axiosInstance.patch(`/employees/${employeeId}`, payload);
    } catch (error) {
      if (error?.response?.status === 404) {
        return await axiosInstance.patch(`/admin/users/${employeeId}`, payload);
      }
      throw error;
    }
  },

  updateEmployeeStatus: async (employeeId, payload) => {
    return await axiosInstance.patch(`/employees/${employeeId}/status`, payload);
  },

  // Position history
  getPositionHistory: async (employeeId) => {
    return await axiosInstance.get(`/employees/${employeeId}/position-history`);
  },

  addPositionHistory: async (employeeId, payload) => {
    return await axiosInstance.post(
      `/employees/${employeeId}/position-history`,
      payload
    );
  },
};

export default employeeAPI;
