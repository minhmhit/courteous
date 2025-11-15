import axiosInstance from "./axiosConfig";

const userAPI = {

  // Admin: Tạo user mới
  registerUser: async (userData) => {
    return await axiosInstance.post("/auth/register", userData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  // Admin: Lấy tất cả users
  getAllUsers: async () => {
    return await axiosInstance.get("/auth/users/");
  },

  // Admin: Ban/Unban user
  updateUserStatus: async (userId, isActive) => {
    return await axiosInstance.put(`/auth/users/${userId}/status`, {
      isActive,
    });
  },

  // Get user profile
  getProfile: async () => {
    return await axiosInstance.get("/auth/users/profile");
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await axiosInstance.put("/auth/users/profile", profileData);
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await axiosInstance.put("/auth/users/password", {
      currentPassword,
      newPassword,
    });
  },
};

export default userAPI;
