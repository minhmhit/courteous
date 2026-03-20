import axiosInstance from "./axiosConfig";

const paymentAPI = {
  getPaymentMethods: async () => {
    return await axiosInstance.get("/payments/methods");
  },

  createPayment: async (paymentData) => {
    return await axiosInstance.post("/payments", paymentData);
  },

  getOrderPayment: async (orderId) => {
    return await axiosInstance.get(`/payments/order/${orderId}`);
  },

  verifyVnpayReturn: async (params) => {
    return await axiosInstance.get("/payments/vnpay/return", { params });
  },
};

export default paymentAPI;
