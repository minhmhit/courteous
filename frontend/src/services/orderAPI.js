import axiosInstance from "./axiosConfig";

const orderAPI = {
  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    return await axiosInstance.post("/orders/add", orderData);
  },

  // Lấy danh sách đơn hàng của user
  getUserOrders: async (page = 1, limit = 10) => {
    return await axiosInstance.get("/orders/", {
      params: { page, limit },
    });
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (orderId) => {
    return await axiosInstance.get(`/orders/${orderId}`);
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId) => {
    return await axiosInstance.put(`/orders/${orderId}/cancel`);
  },

  // Admin: Lấy tất cả đơn hàng
  getAllOrders: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;

    return await axiosInstance.get("/orders/admin/all", { params });
  },

  // Admin: Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (orderId, status) => {
    return await axiosInstance.put(
      `/orders/${orderId}/status`,
      { status },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
  },
};

export default orderAPI;
