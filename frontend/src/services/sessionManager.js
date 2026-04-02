import axios from "axios";
import {
  clearSession,
  getRefreshToken,
  persistSession,
  scheduleTokenRefresh,
} from "../utils/authSession";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

let refreshPromise = null;

const normalizePayload = (response) => response?.data || response || {};

export const applySessionPayload = (payload) => {
  persistSession({
    accessToken: payload?.accessToken || payload?.token,
    refreshToken: payload?.refreshToken,
    user: payload?.user,
  });
  scheduleTokenRefresh(refreshSession);
};

export const refreshSession = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Không tìm thấy refresh token");
  }

  refreshPromise = axios
    .post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        timeout: 30000,
        headers: { "Content-Type": "application/json" },
      },
    )
    .then((response) => {
      const payload = normalizePayload(response.data);
      if (!payload?.accessToken && !payload?.token) {
        throw new Error("Refresh token không trả về access token mới");
      }

      applySessionPayload(payload);
      return payload;
    })
    .catch((error) => {
      const status = error?.response?.status;
      if (status === 400 || status === 401 || status === 403) {
        clearSession();
      }
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Refresh token thất bại";
      throw new Error(message);
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};
