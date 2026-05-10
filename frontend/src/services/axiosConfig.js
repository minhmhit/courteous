import axios from "axios";
import { clearSession, getAccessToken, isTokenExpiringSoon } from "../utils/authSession";
import { refreshSession } from "./sessionManager";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const redirectToLogin = () => {
  clearSession();
  setTimeout(() => {
    window.location.href = "/login";
  }, 100);
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    let token = getAccessToken();
    
    // Nếu token sắp hết hạn, refresh ngay trước khi gửi request
    if (token && isTokenExpiringSoon(token)) {
      try {
        await refreshSession();
        token = getAccessToken();
      } catch (error) {
        console.error("Failed to refresh token before request", error);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config || {};
    const skipAuthRedirect = originalRequest.skipAuthRedirect;
    const skipAuthRefresh = originalRequest.skipAuthRefresh;
    const silentStatuses = Array.isArray(originalRequest.silentStatuses)
      ? originalRequest.silentStatuses
      : [];

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        if (!skipAuthRefresh && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await refreshSession();
            const nextToken = getAccessToken();
            if (nextToken) {
              originalRequest.headers = {
                ...(originalRequest.headers || {}),
                Authorization: `Bearer ${nextToken}`,
              };
            }
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error("Automatic token refresh failed", refreshError);
          }
        }

        if (!skipAuthRedirect && !window.location.pathname.includes("/login")) {
          redirectToLogin();
        }
      }

      if (silentStatuses.includes(status)) {
        return Promise.reject(data || error.message);
      }

      if (status === 403) {
        console.error("Khong co quyen truy cap");
      } else if (status === 409) {
        console.error("Du lieu bi xung dot");
      } else if (status === 404) {
        console.error("Khong tim thay tai nguyen");
      } else if (status === 500) {
        console.error("Loi server");
      } else if (status !== 401) {
        console.error("Loi khong xac dinh:", status);
      }

      return Promise.reject(data || error.message);
    }

    if (error.request) {
      console.error("Loi ket noi mang");
      return Promise.reject({ message: "Khong the ket noi den server" });
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
