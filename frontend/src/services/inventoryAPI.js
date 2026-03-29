import axiosInstance from "./axiosConfig";

const normalizeInventoryResponse = (response) => {
  const data = response?.data ?? response;
  const inventory = Array.isArray(data)
    ? data
    : data?.inventory || data?.data?.inventory || data?.data || [];

  return {
    ...response,
    data: inventory,
  };
};


const inventoryAPI = {
  // Lấy tất cả sản phẩm trong kho
  getAllInventory: async (page = 1, limit = 100) => {
    const response = await axiosInstance.get("/inventory/", {
      params: { page, limit },
    });
    return normalizeInventoryResponse(response);
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
    const response = await axiosInstance.get("/inventory/low-stock", {
      params: { threshold },
    });
    return normalizeInventoryResponse(response);
  },
};

export default inventoryAPI;
