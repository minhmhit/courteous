import axiosInstance from "./axiosConfig";

const employeeAPI = {
  // Admin: Danh sách nhân viên
  getAllEmployees: async (params = {}) => {
    return await axiosInstance.get("/employees", { params });
  },

  // Admin: Chi tiết nhân viên
  getEmployeeById: async (employeeId) => {
    return await axiosInstance.get(`/employees/${employeeId}`);
  },
};

export default employeeAPI;
