import { create } from "zustand";
import { authAPI } from "../services";

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Khởi tạo từ localStorage
  initialize: async () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      // Set state tạm thời để cho phép render
      set({
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
      });

      // Verify token với backend (optional - để tránh delay UI)
      // Nếu token invalid, axios interceptor sẽ tự động xóa và redirect
      try {
        await authAPI.getProfile();
      } catch (error) {
        // Token invalid - interceptor đã xử lý
        console.log(
          "Token verification failed - user will be redirected to login"
        );
      }
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);

      // Handle both response structures: { token, user } or { data: { token, user } }
      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user;

      // Đảm bảo lưu vào localStorage
      if (token) {
        localStorage.setItem("token", token);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      set({
        user: user,
        token: token,
        isAuthenticated: true,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({
        error: error.message || "Đăng nhập thất bại",
        isLoading: false,
      });
      throw error;
    }
  }, // Đăng ký
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        error: error.message || "Đăng ký thất bại",
        isLoading: false,
      });
      throw error;
    }
  },

  // Đăng xuất
  logout: () => {
    authAPI.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // Cập nhật profile
  updateProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = { ...get().user, ...response.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      set({
        user: updatedUser,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({
        error: error.message || "Cập nhật thất bại",
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
