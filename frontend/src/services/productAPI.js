import axiosInstance from "./axiosConfig";

const productAPI = {
  // Lấy tất cả sản phẩm
  getAllProducts: async (page = 1, limit = 20) => {
    return await axiosInstance.get("/product/", {
      params: { page, limit },
    });
  },

  // Lấy sản phẩm theo ID
  getProductById: async (productId) => {
    return await axiosInstance.get(`/product/${productId}`);
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (keyword, page = 1, limit = 10) => {
    return await axiosInstance.get("/product/search", {
      params: { keyword, page, limit },
    });
  },

  // Admin: Thêm sản phẩm mới
  createProduct: async (productData) => {
    return await axiosInstance.post("/product/add", productData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  // Admin: Cập nhật sản phẩm
  updateProduct: async (productId, productData) => {
    return await axiosInstance.put(
      `/product/update/${productId}`,
      productData,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  },

  // Admin: Xóa sản phẩm
  deleteProduct: async (productId) => {
    return await axiosInstance.delete(`/product/delete/${productId}`);
  },
};

export default productAPI;
