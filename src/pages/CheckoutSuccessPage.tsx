import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import api from "@/lib/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { clearGuestCart } from "@/lib/guestCart";
import type { OrderSummary } from "@/stores/useCheckoutStore";

type Outcome = "paid" | "pending" | "failed" | "expired" | "missing";

// A card authorisation can land a moment after the customer is redirected back, so
// a "pending" answer is retried briefly before it is reported as such.
const RETRY_DELAYS_MS = [2000, 3000, 5000];

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  // Paystack echoes back `reference`; OPay uses `reference` too. `trxref` is
  // Paystack's legacy alias and is still sent alongside.
  const reference =
    searchParams.get("reference") || searchParams.get("trxref") || "";

  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const user = useAuthStore((s) => s.user);

  // Guards against React 18 StrictMode double-invoking the effect in development.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!reference) {
      setOutcome("missing");
      return;
    }

    let cancelled = false;

    const verify = async (attempt = 0) => {
      try {
        const res = await api.get(`/payments/verify/${reference}`);
        if (cancelled) return;

        setOrder(res.data.order);

        if (res.data.status === "paid") {
          setOutcome("paid");
          // A signed-in customer's cart was emptied server-side at settlement; a
          // guest's lives in their browser, so it is cleared here or it would follow
          // them back to the shop still full.
          clearGuestCart();
          await fetchCart(false);
          return;
        }

        if (res.data.status === "pending" && attempt < RETRY_DELAYS_MS.length) {
          setTimeout(() => verify(attempt + 1), RETRY_DELAYS_MS[attempt]);
          return;
        }

        setOutcome(res.data.status as Outcome);
      } catch {
        if (!cancelled) setOutcome("failed");
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [reference, fetchCart]);

  if (!outcome) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-surface-400" />
          <p className="mt-5 text-sm text-surface-500">
            Confirming your payment…
          </p>
        </div>
      </div>
    );
  }

  const view = {
    paid: {
      icon: CheckCircle2,
      tone: "",
      title: "Order confirmed",
      body: "Thank you — your payment went through and we're getting your order ready.",
    },
    pending: {
      icon: Clock,
      tone: "",
      title: "Payment still processing",
      body: "Your bank hasn't confirmed this yet. We'll email you the moment it clears — there's no need to pay again.",
    },
    failed: {
      icon: XCircle,
      tone: "",
      title: "Payment didn't go through",
      body: "No money has left your account. You can try again from your cart, and your items are still there.",
    },
    expired: {
      icon: Clock,
      tone: "",
      title: "This checkout expired",
      body: "The payment window closed before it completed. Your cart is untouched — start a new checkout when you're ready.",
    },
    missing: {
      icon: XCircle,
      tone: "",
      title: "Nothing to confirm",
      body: "We couldn't find a payment reference in this link. If you were charged, contact support and we'll sort it out.",
    },
  }[outcome];

  const Icon = view.icon;

  return (
    <div className="animate-fade-in grid min-h-[60vh] place-items-center px-5 py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md text-center"
      >
        <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${view.tone}`}>
          <Icon className="w-7 h-7" strokeWidth={1.75} />
        </div>

        <h1 className="mt-6 font-display text-3xl font-extrabold text-surface-900 sm:text-4xl">
          {view.title}
        </h1>
        <p className="mt-3 text-surface-500 text-pretty">{view.body}</p>

        {order && outcome === "paid" && (
          <div className="card mt-8 p-5 text-left">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-surface-500">Total paid</span>
              <span className="font-semibold tabular-nums text-surface-900">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t hairline pt-3">
              <span className="text-sm text-surface-500">Reference</span>
              <span className="text-sm font-medium text-surface-700">
                {order.reference}
              </span>
            </div>
          </div>
        )}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/products" className="btn btn-primary">
            Continue shopping
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </Link>
          {outcome === "paid" ? (
            <Link to={user ? "/orders" : "/orders/lookup"} className="btn btn-secondary">
              {user ? "View my orders" : "Track this order"}
            </Link>
          ) : outcome === "failed" || outcome === "expired" ? (
            <Link to="/cart" className="btn btn-secondary">
              Back to cart
            </Link>
          ) : (
            <a href="mailto:hello@mosas.com" className="btn btn-secondary">
              Contact support
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccessPage;
