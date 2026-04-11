import axiosInstance from "./axiosConfig";

const leaveTypeAPI = {
  getAllLeaveTypes: async (params = {}) => {
    return await axiosInstance.get("/leave-types", { params });
  },
};

export default leaveTypeAPI;
