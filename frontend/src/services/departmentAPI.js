import axiosInstance from "./axiosConfig";

const departmentAPI = {
  getAllDepartments: async () => {
    return await axiosInstance.get("/departments");
  },

  getDepartmentById: async (id) => {
    return await axiosInstance.get(`/departments/${id}`);
  },

  createDepartment: async (payload) => {
    return await axiosInstance.post("/departments", payload);
  },

  updateDepartment: async (id, payload) => {
    return await axiosInstance.patch(`/departments/${id}`, payload);
  },

  toggleDepartment: async (id, payload) => {
    return await axiosInstance.patch(`/departments/${id}/active`, payload);
  },
};

export default departmentAPI;
