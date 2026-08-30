import { create } from "zustand";
import api from "@/lib/axios";

export interface ShippingZone {
  name: string;
  states: string[];
  fee: number;
}

export interface ShippingSettings {
  zones: ShippingZone[];
  defaultFee: number;
  updatedAt?: string;
  updatedBy?: string;
  states: string[];
}

export interface ShippingQuote {
  /** null when the customer has not saved a state yet, so no fee can be named. */
  fee: number | null;
  zoneName: string | null;
  state: string | null;
}

interface ShippingState {
  quote: ShippingQuote | null;
  isLoadingQuote: boolean;

  settings: ShippingSettings | null;
  isLoadingSettings: boolean;
  isSaving: boolean;

  fetchQuote: (state?: string) => Promise<void>;
  fetchSettings: () => Promise<void>;
  saveSettings: (zones: ShippingZone[], defaultFee: number) => Promise<void>;
}

export const useShippingStore = create<ShippingState>((set) => ({
  quote: null,
  isLoadingQuote: false,
  settings: null,
  isLoadingSettings: false,
  isSaving: false,

  /**
   * The delivery fee for the signed-in customer. Priced server-side from their saved
   * state — the client never picks the number it displays, so the cart total and the
   * amount charged at checkout come from the same rule.
   */
  fetchQuote: async (state) => {
    set({ isLoadingQuote: true });
    try {
      // A guest passes the state they are typing into the checkout form; a signed-in
      // customer passes nothing and the server reads their profile, which it prefers
      // over anything sent here.
      const res = await api.get("/shipping/quote", {
        params: state ? { state } : undefined,
      });
      set({ quote: res.data, isLoadingQuote: false });
    } catch {
      // A quote we could not fetch is shown as "calculated at checkout" rather than
      // as free, which would understate the total.
      set({ quote: null, isLoadingQuote: false });
    }
  },

  fetchSettings: async () => {
    set({ isLoadingSettings: true });
    try {
      const res = await api.get("/shipping/settings");
      set({ settings: res.data, isLoadingSettings: false });
    } catch {
      set({ isLoadingSettings: false });
    }
  },

  saveSettings: async (zones, defaultFee) => {
    set({ isSaving: true });
    try {
      const res = await api.put("/shipping/settings", { zones, defaultFee });
      set({ settings: res.data, isSaving: false });
    } catch (error: any) {
      set({ isSaving: false });
      throw error.response?.data?.message || "Could not save the shipping rates";
    }
  },
}));
