import { create } from "zustand";
import api from "@/lib/axios";

export interface CartItem {
  _id: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    category: string;
    isOnSale?: boolean;
    discountPercent?: number;
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;

  fetchCart: (showLoading?: boolean) => Promise<void>;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async (showLoading = true) => {
    if (showLoading) set({ isLoading: true });
    try {
      const res = await api.get("/cart");
      set({ items: res.data, isLoading: false });
    } catch {
      set({ items: [], isLoading: false });
    }
  },

  addToCart: async (productId) => {
    try {
      await api.post("/cart", { productId });
      await get().fetchCart(false);
    } catch (error: any) {
      throw error.response?.data?.message || "Failed to add item";
    }
  },

  removeFromCart: async (productId) => {
    const previousItems = get().items;
    set((state) => ({
      items: state.items.filter((item) => item.product._id !== productId),
    }));

    try {
      await api.delete(`/cart/${productId}`, { data: { productId } });
      await get().fetchCart(false);
    } catch (error: any) {
      set({ items: previousItems });
      throw error.response?.data?.message || "Failed to remove item";
    }
  },

  updateQuantity: async (productId, quantity) => {
    const previousItems = get().items;
    set((state) => ({
      items: state.items.map((item) =>
        item.product?._id === productId ? { ...item, quantity } : item
      ),
    }));

    try {
      await api.put(`/cart/${productId}`, { quantity });
      await get().fetchCart(false);
    } catch (error: any) {
      set({ items: previousItems });
      throw error.response?.data?.message || "Failed to update quantity";
    }
  },

  clearCart: async () => {
    try {
      await api.delete("/cart/clear");
      set({ items: [] });
    } catch (error: any) {
      throw error.response?.data?.message || "Failed to clear cart";
    }
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => {
      if (!item.product) return sum;
      const price = item.product.isOnSale && item.product.discountPercent
        ? item.product.price * (1 - item.product.discountPercent / 100)
        : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
