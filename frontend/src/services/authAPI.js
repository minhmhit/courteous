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

    console.log("Login response:", response); // Debug log

    // Lưu token vào localStorage
    if (response.token) {
      localStorage.setItem("token", response.token);
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    } else if (response.data?.token) {
      // Trường hợp response có nested data
      localStorage.setItem("token", response.data.token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }

    return response;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  // Lấy thông tin profile
  getProfile: async () => {
    return await axiosInstance.get("/auth/users/profile");
  },

  // Cập nhật profile
  updateProfile: async (userData) => {
    return await axiosInstance.put("/users/profile", userData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    return await axiosInstance.put("/auth/users/password", passwordData, {
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
