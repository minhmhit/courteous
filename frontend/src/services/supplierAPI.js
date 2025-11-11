import axiosInstance from "./axiosConfig";

const supplierAPI = {
  // Lấy tất cả nhà cung cấp
  getAllSuppliers: async () => {
    return await axiosInstance.get("/suppliers/");
  },

  // Lấy nhà cung cấp theo ID
  getSupplierById: async (supplierId) => {
    return await axiosInstance.get(`/suppliers/${supplierId}`);
  },

  // Admin: Thêm nhà cung cấp mới
  createSupplier: async (supplierData) => {
    return await axiosInstance.post("/suppliers/add", supplierData);
  },

  // Admin: Cập nhật nhà cung cấp
  updateSupplier: async (supplierId, supplierData) => {
    return await axiosInstance.put(
      `/suppliers/update/${supplierId}`,
      supplierData
    );
  },

  // Admin: Xóa nhà cung cấp
  deleteSupplier: async (supplierId) => {
    return await axiosInstance.delete(`/suppliers/delete/${supplierId}`);
  },
};

export default supplierAPI;
