import axiosInstance from "./axiosConfig";
import { unwrapData } from "./apiUtils";

const normalizeReceiptCollection = (response) => {
  const payload = unwrapData(response);
  const receipts = Array.isArray(payload)
    ? payload
    : payload?.receipts || payload?.items || response?.receipts || [];

  return {
    ...response,
    data: receipts,
    pagination: response?.pagination ?? payload?.pagination ?? null,
  };
};

const receiptAPI = {
  getAllReceipts: async (page = 1, limit = 100) => {
    const response = await axiosInstance.get("/receipts", {
      params: { page, limit },
    });
    return normalizeReceiptCollection(response);
  },

  getReceiptById: async (receiptId) => {
    const response = await axiosInstance.get(`/receipts/${receiptId}`);
    return {
      ...response,
      data: unwrapData(response),
    };
  },

  getReceiptByOrderId: async (orderId) => {
    const response = await axiosInstance.get(`/receipts/order/${orderId}`);
    const payload = unwrapData(response);
    return {
      ...response,
      data: Array.isArray(payload) ? payload : payload ? [payload] : [],
    };
  },
};

export default receiptAPI;
