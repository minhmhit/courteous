import { create } from "zustand";
import { cartAPI } from "../services";

const useCartStore = create((set, get) => ({
  cart: null,
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,

  // Lấy giỏ hàng
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartAPI.getCart();
      const items = response.items || [];
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      set({
        cart: response,
        items,
        totalItems,
        totalPrice,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || "Không thể tải giỏ hàng",
        isLoading: false,
      });
    }
  },

  // Thêm vào giỏ hàng
  addToCart: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      await cartAPI.addToCart(productId, quantity);
      await get().fetchCart(); // Refresh giỏ hàng
      return true;
    } catch (error) {
      set({
        error: error.message || "Không thể thêm vào giỏ hàng",
        isLoading: false,
      });
      throw error;
    }
  },

  // Cập nhật số lượng
  updateQuantity: async (cartItemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      await cartAPI.updateCartItem(cartItemId, quantity);
      await get().fetchCart();
      return true;
    } catch (error) {
      set({
        error: error.message || "Không thể cập nhật",
        isLoading: false,
      });
      throw error;
    }
  },

  // Xóa khỏi giỏ hàng
  removeFromCart: async (cartItemId) => {
    set({ isLoading: true, error: null });
    try {
      await cartAPI.removeFromCart(cartItemId);
      await get().fetchCart();
      return true;
    } catch (error) {
      set({
        error: error.message || "Không thể xóa sản phẩm",
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear giỏ hàng (sau khi đặt hàng)
  clearCart: () => {
    set({
      cart: null,
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useCartStore;
