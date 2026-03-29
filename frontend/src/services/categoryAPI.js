import axiosInstance from "./axiosConfig";

const normalizeCategoryListResponse = (response) => {
  const data = response?.data ?? response;
  const categories = Array.isArray(data)
    ? data
    : data?.categories || data?.data || response?.categories || [];

  return {
    ...response,
    data: categories,
  };
};


const categoryAPI = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    const response = await axiosInstance.get("/category/");
    return normalizeCategoryListResponse(response);
  },

  // Lấy danh mục theo ID
  getCategoryById: async (categoryId) => {
    return await axiosInstance.get(`/category/${categoryId}`);
  },

  // Admin: Tạo danh mục mới
  createCategory: async (categoryData) => {
    return await axiosInstance.post("/category/add", categoryData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  // Admin: Cập nhật danh mục
  updateCategory: async (categoryId, categoryData) => {
    return await axiosInstance.put(
      `/category/update/${categoryId}`,
      categoryData,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  },

  // Admin: Xóa danh mục
  deleteCategory: async (categoryId) => {
    return await axiosInstance.delete(`/category/delete/${categoryId}`);
  },
};

export default categoryAPI;
