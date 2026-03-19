import axiosInstance from "./axiosConfig";
import { normalizeOrder, unwrapData } from "./apiUtils";

const normalizeOrderCollection = (response) => {
  const payload = unwrapData(response);
  const orders = Array.isArray(payload)
    ? payload
    : payload?.orders || payload?.items || response?.orders || [];

  return {
    ...response,
    data: orders.map(normalizeOrder),
    pagination: response?.pagination ?? payload?.pagination ?? null,
  };
};

const orderAPI = {
  createOrder: async (orderData) => {
    const response = await axiosInstance.post("/orders/add", orderData);
    return {
      ...response,
      data: normalizeOrder(unwrapData(response)),
    };
  },

  getUserOrders: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get("/orders", {
      params: { page, limit },
    });
    return normalizeOrderCollection(response);
  },

  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return {
      ...response,
      data: normalizeOrder(unwrapData(response)),
    };
  },

  cancelOrder: async (orderId) => {
    const response = await axiosInstance.put(`/orders/${orderId}/cancel`);
    return {
      ...response,
      data: normalizeOrder(unwrapData(response)),
    };
  },

  getAllOrders: async (page = 1, limit = 10, status = null) => {
    const params = { page, limit };
    if (status) params.status = status;

    const response = await axiosInstance.get("/orders/admin/all", { params });
    return normalizeOrderCollection(response);
  },

  updateOrderStatus: async (orderId, status) => {
    const payload = typeof status === "string" ? { status } : status;
    const response = await axiosInstance.put(`/orders/${orderId}/status`, payload);
    return {
      ...response,
      data: normalizeOrder(unwrapData(response)),
    };
  },
};

export default orderAPI;
