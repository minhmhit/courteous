import axiosInstance from './axiosConfig';

const addressAPI = {
  // Lấy danh sách địa chỉ của user hiện tại
  getMyAddresses: async () => {
    return await axiosInstance.get('/addresses/');
  },

  // Lấy địa chỉ mặc định
  getDefaultAddress: async () => {
    return await axiosInstance.get('/addresses/default');
  },

  // Tạo địa chỉ mới
  createAddress: async (data) => {
    return await axiosInstance.post('/addresses/', data);
  },

  // Cập nhật địa chỉ
  updateAddress: async (id, data) => {
    return await axiosInstance.put(`/addresses/${id}`, data);
  },

  // Xóa địa chỉ
  deleteAddress: async (id) => {
    return await axiosInstance.delete(`/addresses/${id}`);
  },

  // Đặt địa chỉ làm mặc định
  setDefaultAddress: async (id) => {
    return await axiosInstance.put(`/addresses/${id}/set-default`);
  },
};

export default addressAPI;
