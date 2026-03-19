import axiosInstance from "./axiosConfig";
import { normalizeUser, unwrapData } from "./apiUtils";

const extractAuthPayload = (response) => {
  const payload = unwrapData(response);
  const user = normalizeUser(payload?.user);

  return {
    ...payload,
    user,
    token: payload?.token ?? payload?.accessToken ?? null,
    accessToken: payload?.accessToken ?? payload?.token ?? null,
    refreshToken: payload?.refreshToken ?? null,
  };
};

const authAPI = {
  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    const payload = unwrapData(response);
    return {
      ...response,
      data: normalizeUser(payload),
    };
  },

  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    const payload = extractAuthPayload(response);

    if (payload.accessToken) {
      localStorage.setItem("token", payload.accessToken);
    }
    if (payload.refreshToken) {
      localStorage.setItem("refreshToken", payload.refreshToken);
    }
    if (payload.user) {
      localStorage.setItem("user", JSON.stringify(payload.user));
    }

    return payload;
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // Ignore logout request failure and clear local session anyway.
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  logoutAll: async () => axiosInstance.post("/auth/logout-all"),

  refresh: async (refreshToken) => {
    const response = await axiosInstance.post(
      "/auth/refresh",
      { refreshToken },
      { skipAuthRedirect: true },
    );
    return extractAuthPayload(response);
  },

  getProfile: async () => {
    const response = await axiosInstance.get("/auth/me");
    const payload = unwrapData(response);
    return {
      ...response,
      data: normalizeUser(payload),
    };
  },

  updateProfile: async (userData) => {
    const response = await axiosInstance.patch("/auth/me/profile", userData);
    const payload = unwrapData(response);
    const user = normalizeUser(payload);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return {
      ...response,
      data: user,
    };
  },

  changePassword: async (passwordData) =>
    axiosInstance.patch("/auth/me/password", passwordData),

  getSessions: async () => {
    const response = await axiosInstance.get("/auth/sessions");
    return {
      ...response,
      data: Array.isArray(unwrapData(response)) ? unwrapData(response) : [],
    };
  },

  revokeSession: async (sessionId) =>
    axiosInstance.delete(`/auth/sessions/${sessionId}`),

  isAuthenticated: () => !!localStorage.getItem("token"),

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    if (!user) return null;

    try {
      return normalizeUser(JSON.parse(user));
    } catch {
      return null;
    }
  },
};

export default authAPI;
