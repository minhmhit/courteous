import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi tập trung
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const skipAuthRedirect = error.config?.skipAuthRedirect;

    // Xử lý các lỗi HTTP
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token hết hạn hoặc không hợp lệ
          // Một số request phụ trợ (ví dụ lấy giỏ hàng ở navbar) không nên làm mất phiên toàn cục.
          if (!skipAuthRedirect && !window.location.pathname.includes("/login")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Thêm timeout nhỏ để tránh race condition với initialize
            setTimeout(() => {
              window.location.href = "/login";
            }, 100);
          }
          break;
        case 403:
          console.error("Không có quyền truy cập");
          break;
        case 404:
          console.error("Không tìm thấy tài nguyên");
          break;
        case 500:
          console.error("Lỗi server");
          break;
        default:
          console.error("Lỗi không xác định:", status);
      }

      return Promise.reject(data || error.message);
    }

    // Lỗi network
    if (error.request) {
      console.error("Lỗi kết nối mạng");
      return Promise.reject({ message: "Không thể kết nối đến server" });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
