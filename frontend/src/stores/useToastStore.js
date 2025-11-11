import { create } from "zustand";

const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, type = "info", duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Tự động xóa sau duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // Helper methods
  success: (message, duration) => {
    useToastStore.getState().addToast(message, "success", duration);
  },

  error: (message, duration) => {
    useToastStore.getState().addToast(message, "error", duration);
  },

  info: (message, duration) => {
    useToastStore.getState().addToast(message, "info", duration);
  },

  warning: (message, duration) => {
    useToastStore.getState().addToast(message, "warning", duration);
  },
}));

export default useToastStore;
