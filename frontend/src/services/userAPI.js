import axiosInstance from "./axiosConfig";
import { normalizeUser, unwrapData } from "./apiUtils";

const normalizeUsersCollection = (response) => {
  const payload = unwrapData(response);
  const users = Array.isArray(payload)
    ? payload
    : payload?.users || payload?.items || response?.users || [];

  return {
    ...response,
    data: users.map(normalizeUser),
    pagination: response?.pagination ?? payload?.pagination ?? null,
  };
};

const userAPI = {
  getMe: async () => {
    const response = await axiosInstance.get("/users/me");
    return {
      ...response,
      data: normalizeUser(unwrapData(response)),
    };
  },

  updateMe: async (profileData) => {
    const response = await axiosInstance.patch("/users/me", profileData);
    return {
      ...response,
      data: normalizeUser(unwrapData(response)),
    };
  },

  getAllUsers: async (page = 1, limit = 20, filters = {}) => {
    const response = await axiosInstance.get("/admin/users", {
      params: { page, limit, ...filters },
    });
    return normalizeUsersCollection(response);
  },

  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return {
      ...response,
      data: normalizeUser(unwrapData(response)),
    };
  },

  createUser: async (userData) => {
    const response = await axiosInstance.post("/admin/users", userData);
    return {
      ...response,
      data: normalizeUser(unwrapData(response)),
    };
  },

  registerUser: async (userData) => userAPI.createUser(userData),

  updateUser: async (userId, userData) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}`, userData);
    return {
      ...response,
      data: normalizeUser(unwrapData(response)),
    };
  },

  deleteUser: async (userId) => axiosInstance.delete(`/admin/users/${userId}`),

  updateUserStatus: async (userId, isActive) =>
    axiosInstance.patch(`/admin/users/${userId}/active`, {
      isActive: Boolean(isActive),
    }),

  getProfile: async () => userAPI.getMe(),

  updateProfile: async (profileData) => userAPI.updateMe(profileData),
};

export default userAPI;
