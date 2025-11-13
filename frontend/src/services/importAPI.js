import axiosInstance from "./axiosConfig";

const importAPI = {
  // Lấy danh sách phiếu nhập hàng
  getAllImports: async (page = 1, limit = 100) => {
    return await axiosInstance.get("/imports/", {
      params: { page, limit },
    });
  },

  // Lấy chi tiết phiếu nhập hàng
  getImportById: async (importId) => {
    return await axiosInstance.get(`/imports/${importId}`);
  },

  // Warehouse: Tạo phiếu nhập hàng mới
  createImport: async (importData) => {
    return await axiosInstance.post("/imports/add", importData);
  },

  // Warehouse: Cập nhật trạng thái thanh toán
  updatePaymentStatus: async (importId, status) => {
    return await axiosInstance.patch(`/imports/${importId}/status`, { status });
  },

  // Warehouse: Xóa phiếu nhập hàng
  deleteImport: async (importId) => {
    return await axiosInstance.delete(`/imports/${importId}`);
  },
};

export default importAPI;
