import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Package, Mail, ImageOff, ArrowRight } from "lucide-react";
import api from "@/lib/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatPrice, formatDate } from "@/lib/format";

interface FoundOrder {
  _id: string;
  items: {
    product: { _id: string; name: string; image: string } | null;
    name?: string;
    image?: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shippingFee: number;
  shippingZone: string | null;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentProvider: string;
  paymentReference: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  pending: "Being prepared",
  processing: "Being prepared",
  shipped: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_STYLES: Record<string, string> = {
  awaiting_payment: "",
  pending: "",
  processing: "",
  shipped: "",
  delivered: "",
  cancelled: "",
};

/**
 * Where a guest picks their order back up.
 *
 * Reference and email together, because the reference travels in a URL the customer
 * may well paste somewhere, and on its own it should not be enough to open an order
 * that carries a home address.
 */
const OrderLookupPage = () => {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<FoundOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await api.post("/orders/lookup", {
        reference: reference.trim(),
        email: email.trim(),
      });
      setOrder(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "We couldn't find that order. Check the reference and email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="container-page max-w-2xl py-12 sm:py-16">
        <p className="eyebrow">Order status</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-surface-900 sm:text-4xl">
          Find your order
        </h1>
        <p className="mt-2 text-surface-500 text-pretty">
          Enter the reference from your confirmation screen and the email you used at
          checkout.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="reference" className="label">
              Order reference
            </label>
            <div className="relative">
              <Package
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
                strokeWidth={1.75}
              />
              <input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="MOSAS-XXXXXXXX-XXXXXXXXXX"
                required
                className="field field-icon font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lookup-email" className="label">
              Email used at checkout
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
                strokeWidth={1.75}
              />
              <input
                id="lookup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="field field-icon"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Search className="w-4 h-4" strokeWidth={1.75} />
                Find my order
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {order && (
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="card mt-8 overflow-hidden"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b hairline p-5 sm:px-6">
              <div>
                <span className={`badge ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                  {STATUS_LABELS[order.status] ?? order.status.replace(/_/g, " ")}
                </span>
                <p className="mt-2.5 text-sm text-surface-500">
                  Placed {formatDate(order.createdAt)}
                </p>
                <p className="mt-1 font-mono text-xs text-surface-400">
                  {order.paymentReference}
                </p>
              </div>
              <p className="text-lg font-semibold tabular-nums text-surface-900">
                {formatPrice(order.totalAmount)}
              </p>
            </div>

            <ul className="divide-y hairline">
              {order.items.map((item, i) => {
                const name = item.product?.name ?? item.name ?? "Item no longer available";
                const image = item.product?.image ?? item.image;
                return (
                  <li key={i} className="flex items-center gap-4 p-5 sm:px-6">
                    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-100">
                      {image ? (
                        <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <ImageOff className="w-5 h-5 text-surface-400" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-surface-900">
                        {name}
                      </p>
                      <p className="mt-0.5 text-sm text-surface-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <dl className="space-y-2 border-t hairline bg-surface-50 p-5 text-sm sm:px-6">
              <div className="flex justify-between">
                <dt className="text-surface-500">Subtotal</dt>
                <dd className="tabular-nums text-surface-700">
                  {formatPrice(order.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-surface-500">
                  Shipping
                  {order.shippingZone && (
                    <span className="ml-1.5 text-surface-400">
                      ({order.shippingZone})
                    </span>
                  )}
                </dt>
                <dd className="tabular-nums text-surface-700">
                  {order.shippingFee === 0 ? (
                    <span className="text-green-700">Free</span>
                  ) : (
                    formatPrice(order.shippingFee)
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t hairline pt-2">
                <dt className="font-medium text-surface-900">Total</dt>
                <dd className="font-semibold tabular-nums text-surface-900">
                  {formatPrice(order.totalAmount)}
                </dd>
              </div>
            </dl>

            {order.paymentStatus === "pending" && order.paymentProvider === "bank_transfer" && (
              <div className="flex items-center justify-between gap-4 border-t hairline p-5 sm:px-6">
                <p className="text-sm text-surface-500">
                  We haven't seen this transfer yet.
                </p>
                <Link
                  to={`/checkout/transfer/${encodeURIComponent(order.paymentReference)}`}
                  className="btn btn-secondary btn-sm shrink-0"
                >
                  View details
                </Link>
              </div>
            )}
          </motion.article>
        )}

        <p className="mt-8 text-sm text-surface-500">
          Have an account?{" "}
          <Link to="/orders" className="inline-flex items-center gap-1 text-surface-900 underline underline-offset-4">
            See all your orders
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OrderLookupPage;
