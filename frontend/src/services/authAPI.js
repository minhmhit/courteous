import axiosInstance from "./axiosConfig";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  scheduleTokenRefresh,
  setStoredUser,
} from "../utils/authSession";
import { applySessionPayload, refreshSession } from "./sessionManager";

const normalizePayload = (response) => response?.data || response || {};
const normalizeUserPayload = (response) => {
  const payload = normalizePayload(response);
  return payload?.data || payload?.user || payload || null;
};

const authAPI = {
  register: async (userData) => {
    return await axiosInstance.post("/auth/register", userData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    applySessionPayload(normalizePayload(response));
    return response;
  },

  refresh: async () => {
    return await refreshSession();
  },

  restoreSession: async () => {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      scheduleTokenRefresh(refreshSession);
      return { user: storedUser, token };
    }

    if (!refreshToken) {
      return null;
    }

    await refreshSession();
    const profile = await authAPI.getProfile();
    const user = normalizeUserPayload(profile);
    setStoredUser(user);

    return {
      user,
      token: getAccessToken(),
    };
  },

  logout: async () => {
    const token = getAccessToken();

    if (token) {
      try {
        await axiosInstance.post(
          "/auth/logout",
          {},
          {
            skipAuthRefresh: true,
            skipAuthRedirect: true,
          },
        );
      } catch (error) {
        console.error("Logout request failed", error);
      }
    }

    clearSession();
    window.location.href = "/login";
  },

  getProfile: async () => {
    return await axiosInstance.get("/auth/me");
  },

  updateProfile: async (userData) => {
    const response = await axiosInstance.patch("/auth/me/profile", userData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const user = normalizeUserPayload(response);
    if (user) {
      setStoredUser(user);
    }

    return response;
  },

  changePassword: async (passwordData) => {
    return await axiosInstance.patch("/auth/me/password", passwordData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  getAllUsers: async (page = 1, limit = 10) => {
    return await axiosInstance.get("/admin/users", {
      params: { page, limit },
    });
  },

  updateUserStatus: async (userId, isActive) => {
    return await axiosInstance.patch(`/admin/users/${userId}/active`, {
      isActive,
    });
  },

  forgotPassword: async (username) => {
    return await axiosInstance.post("/auth/forgot-password", { username }, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  isAuthenticated: () => !!getAccessToken() || !!getRefreshToken(),

  getCurrentUser: () => getStoredUser(),
};

export default authAPI;
