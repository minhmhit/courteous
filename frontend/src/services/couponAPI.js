import axiosInstance from "./axiosConfig";
import { normalizeCoupon, unwrapData } from "./apiUtils";

const normalizeCouponCollection = (response) => {
  const payload = unwrapData(response);
  const coupons = Array.isArray(payload)
    ? payload
    : payload?.coupons || response?.coupons || [];

  return {
    ...response,
    data: {
      coupons: coupons.map(normalizeCoupon),
      pagination: response?.pagination ?? payload?.pagination ?? null,
    },
  };
};

const couponAPI = {
  getAllCoupons: async (page = 1, limit = 100) => {
    const response = await axiosInstance.get("/coupons", {
      params: { page, limit },
    });
    return normalizeCouponCollection(response);
  },

  verifyCoupon: async (code) => {
    const response = await axiosInstance.post("/coupons/verify", { code });
    return {
      ...response,
      data: normalizeCoupon(unwrapData(response)),
    };
  },

  validateCoupon: async (code) => couponAPI.verifyCoupon(code),

  createCoupon: async (couponData) => {
    const response = await axiosInstance.post("/coupons/add", couponData);
    return {
      ...response,
      data: normalizeCoupon(unwrapData(response)),
    };
  },

  updateCoupon: async (couponId, couponData) => {
    const response = await axiosInstance.put(`/coupons/update/${couponId}`, couponData);
    return {
      ...response,
      data: normalizeCoupon(unwrapData(response)),
    };
  },

  deleteCoupon: async (couponId) =>
    axiosInstance.delete(`/coupons/delete/${couponId}`),
};

export default couponAPI;
