import { create } from "zustand";
import { authAPI } from "../services";
import {
  getAccessToken,
  getStoredUser,
  setStoredUser,
} from "../utils/authSession";

const extractUserPayload = (payload) =>
  payload?.data?.user ||
  payload?.data?.data ||
  payload?.user ||
  payload?.data ||
  payload ||
  null;

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    const token = getAccessToken();
    const user = getStoredUser();

    if (token && user) {
      set({
        token,
        user,
        isAuthenticated: true,
      });
    }

    try {
      const restoredSession = await authAPI.restoreSession();
      if (!restoredSession) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
        });
        return;
      }

      set({
        token: restoredSession.token,
        user: restoredSession.user,
        isAuthenticated: true,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      const payload = response?.data || response;
      const authData = payload?.data || payload;
      const token = authData?.accessToken || authData?.token;
      const user = extractUserPayload(payload);

      set({
        user,
        token,
        isAuthenticated: !!token && !!user,
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

  logout: async () => {
    await authAPI.logout();
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
      const updatedUser = extractUserPayload(response);

      if (updatedUser) {
        setStoredUser(updatedUser);
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
