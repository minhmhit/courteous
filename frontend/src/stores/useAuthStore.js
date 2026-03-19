import { create } from "zustand";
import { authAPI } from "../services";
import { normalizeUser } from "../services/apiUtils";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      return;
    }

    try {
      const user = normalizeUser(JSON.parse(storedUser));
      if (!user) {
        localStorage.removeItem("user");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      set({
        token,
        user,
        isAuthenticated: true,
      });

      await authAPI.getProfile();
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      const token = response.token || response.accessToken || null;
      const user = normalizeUser(response.user);

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({
        error: error.message || "Dang nhap that bai",
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        error: error.message || "Dang ky that bai",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    authAPI.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = normalizeUser(response?.data);

      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      set({
        user: updatedUser,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({
        error: error.message || "Cap nhat that bai",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
