import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, Landmark, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/useCartStore";
import { clearGuestCart } from "@/lib/guestCart";
import type { OrderSummary } from "@/stores/useCheckoutStore";

const POLL_INTERVAL_MS = 5000;

const CopyableRow = ({
  label,
  value,
  emphasise = false,
}: {
  label: string;
  value: string;
  emphasise?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access is denied outside a secure context, and on a payment screen
      // silently doing nothing is worse than telling the customer to copy by hand.
      toast.error("Could not copy — please copy the number manually");
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <dt className="text-sm text-surface-500">{label}</dt>
        <dd
          className={`mt-0.5 truncate text-surface-900 ${
            emphasise
              ? "font-display text-2xl font-extrabold tabular-nums tracking-wide"
              : "font-medium"
          }`}
        >
          {value}
        </dd>
      </div>
      <button
        onClick={copy}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-900"
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" strokeWidth={2} />
        ) : (
          <Copy className="w-4 h-4" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
};

const Countdown = ({ expiresAt }: { expiresAt: string }) => {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - Date.now())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <span className="tabular-nums">
      {minutes}:{String(seconds).padStart(2, "0")}
    </span>
  );
};

const BankTransferPage = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Held in a ref so the polling effect does not restart on every tick.
  const settledRef = useRef(false);

  const poll = useCallback(async () => {
    if (!reference || settledRef.current) return;

    try {
      // `reference` comes straight off the URL, so it is encoded on the way into both
      // the request path and the redirect rather than trusted as a clean token.
      const res = await api.get(`/payments/status/${encodeURIComponent(reference)}`);
      setOrder(res.data.order);

      if (res.data.status === "paid") {
        settledRef.current = true;
        // Same as the success page: a guest's cart is in their browser and nothing
        // server-side will empty it.
        clearGuestCart();
        await fetchCart(false);
        navigate(`/purchase-success?reference=${encodeURIComponent(reference)}`, {
          replace: true,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not load this transfer");
    } finally {
      setLoading(false);
    }
  }, [reference, navigate, fetchCart]);

  useEffect(() => {
    poll();
    // Transfers settle out of band, so the page asks rather than waits. The server
    // endpoint reads only our own database, so this costs no provider quota.
    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [poll]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5">
        <LoadingSpinner size="lg" className="text-surface-400" />
      </div>
    );
  }

  if (error || !order?.virtualAccount) {
    return (
      <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="w-7 h-7" strokeWidth={1.75} />
          </div>
          <h1 className="mt-6 font-display text-2xl font-extrabold text-surface-900">
            We couldn't load this transfer
          </h1>
          <p className="mt-2 text-surface-500">
            {error || "The account details are no longer available."}
          </p>
          <Link to="/cart" className="btn btn-primary mt-8">
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  const { virtualAccount } = order;
  const expired =
    order.paymentStatus === "expired" ||
    new Date(virtualAccount.expiresAt).getTime() < Date.now();

  return (
    <div className="animate-fade-in container-page py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-lg"
      >
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface-100 text-surface-600">
            <Landmark className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-surface-900">
            Transfer {formatPrice(order.totalAmount)}
          </h1>
          <p className="mt-2.5 text-surface-500 text-pretty">
            Send the exact amount to the account below from any bank app. We'll confirm
            it automatically — usually within a minute.
          </p>
        </div>

        <div className="card mt-9 p-6 sm:p-8">
          <dl className="divide-y hairline">
            <CopyableRow label="Bank" value={virtualAccount.bankName} />
            <CopyableRow
              label="Account number"
              value={virtualAccount.accountNumber}
              emphasise
            />
            <CopyableRow label="Account name" value={virtualAccount.accountName} />
            <CopyableRow
              label="Exact amount"
              value={formatPrice(order.totalAmount)}
              emphasise
            />
          </dl>

          <div
            className={`mt-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm ${
              expired
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            {expired ? (
              <span>This transfer window has closed. Start a new checkout to retry.</span>
            ) : (
              <span>
                Account expires in <Countdown expiresAt={virtualAccount.expiresAt} />
              </span>
            )}
          </div>
        </div>

        {!expired && (
          <div className="mt-7 flex items-center justify-center gap-2.5 text-sm text-surface-500">
            <LoadingSpinner size="sm" />
            Waiting for your transfer…
          </div>
        )}

        <p className="mt-8 text-center text-xs text-surface-400">
          Reference {order.reference} — quote this if you need to contact support.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            to="/orders/lookup"
            className="inline-flex items-center gap-2 rounded text-sm text-surface-500 transition-colors hover:text-surface-900"
          >
            View my orders
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default BankTransferPage;
