import axiosInstance from "./axiosConfig";

const userAPI = {
  // Admin: Danh sách users
  getAllUsers: async (params = {}) => {
    return await axiosInstance.get("/admin/users", { params });
  },

  // Admin: Chi tiết user
  getUserById: async (userId) => {
    return await axiosInstance.get(`/admin/users/${userId}`);
  },

  // Admin: Tạo user mới
  createUser: async (userData) => {
    return await axiosInstance.post("/admin/users", userData);
  },

  // Admin: Cập nhật user
  updateUser: async (userId, userData) => {
    return await axiosInstance.patch(`/admin/users/${userId}`, userData);
  },

  // Admin: Xóa (soft delete)
  deleteUser: async (userId) => {
    return await axiosInstance.delete(`/admin/users/${userId}`);
  },

  // Admin: Kích hoạt / vô hiệu hóa
  updateUserStatus: async (userId, isActive) => {
    return await axiosInstance.patch(`/admin/users/${userId}/active`, {
      isActive,
    });
  },

  // Self: Get profile
  getProfile: async () => {
    return await axiosInstance.get("/users/me");
  },

  // Self: Update profile
  updateProfile: async (profileData) => {
    return await axiosInstance.patch("/users/me", profileData);
  },

  // Self: Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    return await axiosInstance.patch("/auth/me/password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  },
};

export default userAPI;
