import axiosInstance from "./axiosConfig";

const normalizeProductListResponse = (response) => {
  const data = response?.data ?? response;
  const products = Array.isArray(data)
    ? data
    : data?.products || response?.products || [];

  const total =
    data?.total ||
    data?.pagination?.total ||
    response?.total ||
    products.length;

  return {
    ...response,
    data: products,
    total,
  };
};

const normalizeProductDetailResponse = (response) => {
  const data = response?.data ?? response;
  const product =
    data && !Array.isArray(data) ? data?.product || data : response?.product || null;

  return {
    ...response,
    data: product,
  };
};

const productAPI = {
  // Lấy tất cả sản phẩm
  getAllProducts: async (page = 1, limit = 20) => {
    const response = await axiosInstance.get("/product/", {
      params: { page, limit },
    });
    return normalizeProductListResponse(response);
  },

  // Lấy sản phẩm theo ID
  getProductById: async (productId) => {
    const response = await axiosInstance.get(`/product/${productId}`);
    return normalizeProductDetailResponse(response);
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (keyword, page = 1, limit = 10) => {
    const response = await axiosInstance.get("/product/search", {
      params: { keyword, page, limit },
    });
    return normalizeProductListResponse(response);
  },

  // Admin: Thêm sản phẩm mới
  createProduct: async (productData) => {
    return await axiosInstance.post("/product/add", productData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  // Admin: Upload product image (multipart/form-data)
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file); // phải trùng với upload.single("image")

    return await axiosInstance.post("/uploads/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
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
