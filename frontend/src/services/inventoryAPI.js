import axiosInstance from "./axiosConfig";

const inventoryAPI = {
  // Lấy tất cả sản phẩm trong kho
  getAllInventory: async (page = 1, limit = 100) => {
    return await axiosInstance.get("/inventory/", {
      params: { page, limit },
    });
  },

  // Lấy thông tin tồn kho theo sản phẩm
  getInventoryByProduct: async (productId) => {
    return await axiosInstance.get(`/inventory/${productId}`);
  },

  // Warehouse: Cập nhật số lượng tồn kho
  updateInventory: async (productId, quantity) => {
    return await axiosInstance.put(`/inventory/${productId}`, { quantity });
  },

  // Lấy sản phẩm sắp hết hàng
  getLowStockProducts: async (threshold = 10) => {
    return await axiosInstance.get("/inventory/low-stock", {
      params: { threshold },
    });
  },
};

export default inventoryAPI;
