import axiosInstance from "./axiosConfig";
import { normalizePaymentMethod, unwrapData } from "./apiUtils";

const paymentAPI = {
  getMethods: async () => {
    const response = await axiosInstance.get("/payments/methods");
    const payload = unwrapData(response);
    const methods = Array.isArray(payload) ? payload : payload?.methods || [];

    return {
      ...response,
      data: methods.map(normalizePaymentMethod),
    };
  },

  createPayment: async (paymentData) => {
    const response = await axiosInstance.post("/payments", paymentData);
    return {
      ...response,
      data: unwrapData(response),
    };
  },

  getHistory: async (page = 1, limit = 20) => {
    const response = await axiosInstance.get("/payments/history", {
      params: { page, limit },
    });
    return {
      ...response,
      data: unwrapData(response),
    };
  },

  getOrderPayment: async (orderId) => {
    const response = await axiosInstance.get(`/payments/order/${orderId}`);
    return {
      ...response,
      data: unwrapData(response),
    };
  },

  getPaymentById: async (paymentId) => {
    const response = await axiosInstance.get(`/payments/${paymentId}`);
    return {
      ...response,
      data: unwrapData(response),
    };
  },

  getAllPayments: async (params = {}) => {
    const response = await axiosInstance.get("/payments", { params });
    return {
      ...response,
      data: unwrapData(response),
    };
  },

  confirmPayment: async (paymentId) =>
    axiosInstance.post(`/payments/${paymentId}/confirm`),

  failPayment: async (paymentId) =>
    axiosInstance.post(`/payments/${paymentId}/fail`),

  queryVnpay: async (orderId, transactionDate) =>
    axiosInstance.get(`/payments/vnpay/query/${orderId}`, {
      params: transactionDate ? { transactionDate } : {},
    }),
};

export default paymentAPI;
