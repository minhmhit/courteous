import axiosInstance from "./axiosConfig";

const couponAPI = {
  // Lấy tất cả mã giảm giá
  getAllCoupons: async () => {
    return await axiosInstance.get("/coupons/");
  },

  // Lấy mã giảm giá theo code
  getCouponByCode: async (code) => {
    return await axiosInstance.get(`/coupons/code/${code}`);
  },

  // Kiểm tra mã giảm giá có hợp lệ không
  validateCoupon: async (code) => {
    return await axiosInstance.get(`/coupons/validate/${code}`);
  },

  // Admin: Thêm mã giảm giá mới
  createCoupon: async (couponData) => {
    return await axiosInstance.post("/coupons/add", couponData);
  },

  // Admin: Cập nhật mã giảm giá
  updateCoupon: async (couponId, couponData) => {
    return await axiosInstance.put(`/coupons/update/${couponId}`, couponData);
  },

  // Admin: Xóa mã giảm giá
  deleteCoupon: async (couponId) => {
    return await axiosInstance.delete(`/coupons/delete/${couponId}`);
  },
};

export default couponAPI;
