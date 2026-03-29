import axiosInstance from "./axiosConfig";

const positionAPI = {
  getAllPositions: async () => {
    return await axiosInstance.get("/positions");
  },

  getPositionById: async (id) => {
    return await axiosInstance.get(`/positions/${id}`);
  },

  createPosition: async (payload) => {
    return await axiosInstance.post("/positions", payload);
  },

  updatePosition: async (id, payload) => {
    return await axiosInstance.patch(`/positions/${id}`, payload);
  },

  togglePosition: async (id, payload) => {
    return await axiosInstance.patch(`/positions/${id}/active`, payload);
  },
};

export default positionAPI;
