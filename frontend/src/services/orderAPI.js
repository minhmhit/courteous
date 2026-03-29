import axiosInstance from "./axiosConfig";

const normalizeOrderListResponse = (response) => {
  const data = response?.data ?? response;
  const orders = Array.isArray(data)
    ? data
    : data?.orders || data?.data || response?.orders || [];

  return {
    ...response,
    data: orders,
  };
};

const normalizeOrderDetailResponse = (response) => {
  const data = response?.data ?? response;
  const order = data && !Array.isArray(data) ? data?.order || data?.data || data : null;

  return {
    ...response,
    data: order,
  };
};


const orderAPI = {
  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    return await axiosInstance.post("/orders/add", orderData);
  },

  // Lấy danh sách đơn hàng của user
  getUserOrders: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get("/orders/", {
      params: { page, limit },
    });
    return normalizeOrderListResponse(response);
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return normalizeOrderDetailResponse(response);
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId) => {
    return await axiosInstance.put(`/orders/${orderId}/cancel`);
  },

  // Admin: Lấy tất cả đơn hàng
  getAllOrders: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;

    const response = await axiosInstance.get("/orders/admin/all", { params });
    return normalizeOrderListResponse(response);
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
