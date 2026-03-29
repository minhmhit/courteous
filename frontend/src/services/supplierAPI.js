import axiosInstance from "./axiosConfig";

const normalizeSupplierListResponse = (response) => {
  const data = response?.data ?? response;
  const suppliers = Array.isArray(data)
    ? data
    : data?.suppliers?.data || data?.suppliers || data?.data || response?.suppliers || [];

  return {
    ...response,
    data: suppliers,
  };
};

const normalizeSupplierDetailResponse = (response) => {
  const data = response?.data ?? response;
  const supplier = data && !Array.isArray(data) ? data?.supplier || data?.data || data : null;

  return {
    ...response,
    data: supplier,
  };
};


const supplierAPI = {
  // Lấy tất cả nhà cung cấp
  getAllSuppliers: async () => {
    const response = await axiosInstance.get("/suppliers/");
    return normalizeSupplierListResponse(response);
  },

  // Lấy nhà cung cấp theo ID
  getSupplierById: async (supplierId) => {
    const response = await axiosInstance.get(`/suppliers/${supplierId}`);
    return normalizeSupplierDetailResponse(response);
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
