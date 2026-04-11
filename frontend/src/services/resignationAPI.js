import axiosInstance from "./axiosConfig";

const resignationAPI = {
  // Self
  getMyResignations: async () => {
    return await axiosInstance.get("/resignation-requests/me");
  },

  createResignation: async (payload) => {
    return await axiosInstance.post("/resignation-requests", payload);
  },

  cancelResignation: async (requestId) => {
    return await axiosInstance.patch(
      `/resignation-requests/${requestId}/cancel`
    );
  },

  // HR/Admin
  getPendingResignations: async () => {
    return await axiosInstance.get("/resignation-requests/pending");
  },

  approveResignation: async (requestId) => {
    return await axiosInstance.patch(
      `/resignation-requests/${requestId}/approve`
    );
  },

  rejectResignation: async (requestId, payload) => {
    return await axiosInstance.patch(
      `/resignation-requests/${requestId}/reject`,
      payload
    );
  },
};

export default resignationAPI;
