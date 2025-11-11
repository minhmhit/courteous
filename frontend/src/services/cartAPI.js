import axiosInstance from './axiosConfig';

const cartAPI = {
  // Lấy giỏ hàng
  getCart: async () => {
    return await axiosInstance.get('/cart/');
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (productId, quantity = 1) => {
    return await axiosInstance.post('/cart/add', 
      { productId, quantity },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}
    );
  },

  // Cập nhật số lượng sản phẩm trong giỏ
  updateCartItem: async (cartItemId, quantity) => {
    return await axiosInstance.put(`/cart/update/${cartItemId}`, 
      { quantity },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}
    );
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (cartItemId) => {
    return await axiosInstance.delete(`/cart/remove/${cartItemId}`);
  },
};

export default cartAPI;
