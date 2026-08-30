import { create } from "zustand";
import api from "@/lib/axios";

export type PaymentProvider = "paystack" | "opay" | "bank_transfer";

export interface PaymentMethod {
  id: PaymentProvider;
  label: string;
  description: string;
  enabled: boolean;
}

export interface VirtualAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  expiresAt: string;
}

export interface OrderSummary {
  id: string;
  reference: string;
  items: { name: string; image?: string; quantity: number; price: number }[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  paymentProvider: PaymentProvider;
  paymentStatus: "pending" | "paid" | "failed" | "expired" | "refunded";
  status: string;
  virtualAccount?: VirtualAccount;
  paidAt?: string;
  createdAt: string;
}

/**
 * What a guest sends with their checkout. Signed-in customers send none of it — the
 * server reads their account and their stored cart instead.
 */
export interface GuestCheckout {
  contact: { name: string; email: string };
  address: {
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: { productId: string; quantity: number }[];
}

interface CheckoutState {
  methods: PaymentMethod[];
  isLoadingMethods: boolean;
  isInitializing: boolean;

  fetchMethods: () => Promise<void>;
  startCheckout: (
    provider: PaymentProvider,
    guest?: GuestCheckout | null
  ) => Promise<OrderSummary>;
}

// Endpoint path per provider — the server owns which of these are actually offered.
const INIT_ENDPOINTS: Record<PaymentProvider, string> = {
  paystack: "/payments/paystack/initialize",
  opay: "/payments/opay/initialize",
  bank_transfer: "/payments/bank-transfer/initialize",
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  methods: [],
  isLoadingMethods: false,
  isInitializing: false,

  fetchMethods: async () => {
    set({ isLoadingMethods: true });
    try {
      const res = await api.get("/payments/methods");
      set({ methods: res.data.methods || [], isLoadingMethods: false });
    } catch {
      set({ methods: [], isLoadingMethods: false });
    }
  },

  /**
   * Creates the order server-side and, for hosted providers, hands back the URL to
   * send the customer to. Bank transfer returns the order with its account details
   * instead, since there is nowhere to redirect to.
   */
  startCheckout: async (provider, guest) => {
    set({ isInitializing: true });
    try {
      // The body is empty for a signed-in customer: sending a cart would be ignored
      // anyway, since the server prices from the one it already holds.
      const res = await api.post(INIT_ENDPOINTS[provider], guest ?? {});
      const { authorizationUrl, order } = res.data;

      if (authorizationUrl) {
        // Full navigation rather than a new tab: providers return the customer to
        // our callback URL, and a popup would strand that return in a dead window.
        window.location.assign(authorizationUrl);
      }

      return order as OrderSummary;
    } catch (error: any) {
      throw (
        error.response?.data?.message ||
        "We could not start your payment. Please try again."
      );
    } finally {
      set({ isInitializing: false });
    }
  },
}));
