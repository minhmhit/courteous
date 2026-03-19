import axios from "axios";
import { normalizeUser } from "./apiUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let pendingRequests = [];

const flushPendingRequests = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(token);
  });
  pendingRequests = [];
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  if (!window.location.pathname.includes("/login")) {
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
    const requestUrl = String(originalRequest.url || "");

    if (error.response) {
      const { status, data } = error.response;

      if (
        status === 401 &&
        !skipAuthRedirect &&
        !originalRequest._retry &&
        !requestUrl.includes("/auth/login") &&
        !requestUrl.includes("/auth/refresh")
      ) {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          clearSessionAndRedirect();
          return Promise.reject(data || error.message);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingRequests.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const payload = refreshResponse.data?.data ?? refreshResponse.data ?? {};
          const nextToken = payload.accessToken ?? payload.token;
          const nextRefreshToken = payload.refreshToken ?? refreshToken;

          if (!nextToken) {
            throw new Error("Khong lay duoc access token moi");
          }

          localStorage.setItem("token", nextToken);
          localStorage.setItem("refreshToken", nextRefreshToken);

          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              localStorage.setItem(
                "user",
                JSON.stringify(normalizeUser(JSON.parse(storedUser))),
              );
            } catch {
              // Ignore malformed cached user.
            }
          }

          flushPendingRequests(null, nextToken);
          originalRequest.headers.Authorization = `Bearer ${nextToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          flushPendingRequests(refreshError, null);
          clearSessionAndRedirect();
          return Promise.reject(
            refreshError.response?.data ||
              refreshError.message ||
              data ||
              error.message,
          );
        } finally {
          isRefreshing = false;
        }
      }

      switch (status) {
        case 403:
          console.error("Khong co quyen truy cap");
          break;
        case 404:
          console.error("Khong tim thay tai nguyen");
          break;
        case 500:
          console.error("Loi server");
          break;
        default:
          console.error("Loi khong xac dinh:", status);
      }

      if (status === 401 && !skipAuthRedirect) {
        clearSessionAndRedirect();
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
