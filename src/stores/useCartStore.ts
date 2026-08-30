import { create } from "zustand";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  addGuestLine,
  clearGuestCart,
  readGuestCart,
  removeGuestLine,
  setGuestQuantity,
  type GuestCartLine,
} from "@/lib/guestCart";

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
  adoptGuestCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
  getCheckoutItems: () => GuestCartLine[];
}

/**
 * Which cart is in play is decided by whether anyone is signed in. A signed-in
 * customer's cart lives on the server so it follows them between devices; a guest's
 * lives in their browser, because there is no account to hang it on.
 */
const isGuest = () => !useAuthStore.getState().user;

/**
 * Turns stored {productId, quantity} lines into the same shape the server's cart
 * endpoint returns, so every component downstream is indifferent to which cart it is
 * looking at. Product details are fetched rather than stored: a cart is a list of
 * intentions, and the catalogue is the authority on what those things are and cost.
 */
const hydrate = async (lines: GuestCartLine[]): Promise<CartItem[]> => {
  if (lines.length === 0) return [];

  const ids = lines.map((line) => line.productId);
  const res = await api.get("/products", { params: { ids: ids.join(",") } });
  const byId = new Map<string, CartItem["product"]>(
    (res.data.products || []).map((p: CartItem["product"]) => [p._id, p])
  );

  // A line whose product has since been delisted is dropped here rather than
  // rendered as a blank row — and dropping it locally keeps the stored cart from
  // failing checkout later, where an unknown id is a hard error.
  return lines.flatMap((line) => {
    const product = byId.get(line.productId);
    return product ? [{ _id: line.productId, quantity: line.quantity, product }] : [];
  });
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async (showLoading = true) => {
    if (showLoading) set({ isLoading: true });
    try {
      const items = isGuest()
        ? await hydrate(readGuestCart())
        : (await api.get("/cart")).data;
      set({ items, isLoading: false });
    } catch {
      set({ items: [], isLoading: false });
    }
  },

  addToCart: async (productId) => {
    try {
      if (isGuest()) {
        set({ items: await hydrate(addGuestLine(productId)) });
        return;
      }
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
      if (isGuest()) {
        set({ items: await hydrate(removeGuestLine(productId)) });
        return;
      }
      await api.delete(`/cart/${productId}`);
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
      if (isGuest()) {
        set({ items: await hydrate(setGuestQuantity(productId, quantity)) });
        return;
      }
      await api.put(`/cart/${productId}`, { quantity });
      await get().fetchCart(false);
    } catch (error: any) {
      set({ items: previousItems });
      throw error.response?.data?.message || "Failed to update quantity";
    }
  },

  clearCart: async () => {
    try {
      if (isGuest()) {
        clearGuestCart();
        set({ items: [] });
        return;
      }
      await api.delete("/cart");
      set({ items: [] });
    } catch (error: any) {
      throw error.response?.data?.message || "Failed to clear cart";
    }
  },

  /**
   * Moves a browser cart onto the account after signing in, then empties it.
   *
   * Called once, immediately after authentication, so that filling a cart and *then*
   * deciding to log in does not silently discard everything. Items are added rather
   * than replacing the server cart: whatever was already on the account was also
   * deliberately put there.
   */
  adoptGuestCart: async () => {
    const lines = readGuestCart();
    if (lines.length === 0) return;

    // Cleared first. If a line fails — a delisted product, say — the alternative is
    // a cart that re-adds itself on every login and can never be emptied.
    clearGuestCart();

    for (const line of lines) {
      try {
        await api.post("/cart", { productId: line.productId });
        if (line.quantity > 1) {
          await api.put(`/cart/${line.productId}`, { quantity: line.quantity });
        }
      } catch {
        // Skip whatever the server will not take; the rest of the cart still arrives.
      }
    }

    await get().fetchCart(false);
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

  /**
   * What a guest checkout posts. Signed-in customers send nothing — the server reads
   * their stored cart — but the shape is harmless to send either way.
   */
  getCheckoutItems: () =>
    get().items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    })),
}));
