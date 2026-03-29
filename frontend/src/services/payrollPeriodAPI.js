import axiosInstance from "./axiosConfig";

const payrollPeriodAPI = {
  getAllPeriods: async (params = {}) => {
    return await axiosInstance.get("/payroll-periods", { params });
  },

  getPeriodById: async (id) => {
    return await axiosInstance.get(`/payroll-periods/${id}`);
  },

  createPeriod: async (payload) => {
    return await axiosInstance.post("/payroll-periods", payload);
  },

  updatePeriod: async (id, payload) => {
    return await axiosInstance.patch(`/payroll-periods/${id}`, payload);
  },

  lockPeriod: async (id) => {
    return await axiosInstance.patch(`/payroll-periods/${id}/lock`);
  },

  markPaid: async (id) => {
    return await axiosInstance.patch(`/payroll-periods/${id}/mark-paid`);
  },
};

export default payrollPeriodAPI;
