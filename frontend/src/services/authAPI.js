import axiosInstance from "./axiosConfig";

const authAPI = {
  // Đăng ký
  register: async (userData) => {
    return await axiosInstance.post("/auth/register", userData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  // Đăng nhập
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });


    // Lưu token vào localStorage
    const payload = response?.data || response;
    const token = payload?.accessToken || payload?.token;
    const refreshToken = payload?.refreshToken;
    const user = payload?.user;

    if (token) {
      localStorage.setItem("token", token);
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  // Lấy thông tin profile
  getProfile: async () => {
    return await axiosInstance.get("/auth/me");
  },

  // Cập nhật profile
  updateProfile: async (userData) => {
    return await axiosInstance.patch("/auth/me/profile", userData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    return await axiosInstance.patch("/auth/me/password", passwordData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  // Admin: Lấy tất cả người dùng
  getAllUsers: async (page = 1, limit = 10) => {
    return await axiosInstance.get("/auth/users/", {
      params: { page, limit },
    });
  },

  // Admin: Cập nhật trạng thái người dùng (ban/unban)
  updateUserStatus: async (userId, isActive) => {
    return await axiosInstance.put(
      `/auth/users/${userId}/status`,
      { isActive },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
  },

  // Kiểm tra token còn hợp lệ không
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Lấy user từ localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default authAPI;
