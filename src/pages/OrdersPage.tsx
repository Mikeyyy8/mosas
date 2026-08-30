import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ArrowRight, ImageOff, Clock } from "lucide-react";
import api from "@/lib/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatPrice, formatDate } from "@/lib/format";

interface OrderItem {
  // Populated from the product, but the order also snapshots name/image at purchase
  // time — a product deleted since should not blank out someone's receipt.
  product: { _id: string; name: string; price: number; image: string } | null;
  name?: string;
  image?: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  shippingZone: string | null;
  totalAmount: number;
  status: string;
  paymentStatus: "pending" | "paid" | "failed" | "expired" | "refunded";
  paymentProvider: "paystack" | "opay" | "bank_transfer";
  paymentReference: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  awaiting_payment: "",
  pending: "",
  processing: "",
  shipped: "",
  delivered: "",
  cancelled: "",
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: "",
  pending: "",
  refunded: "",
};

const PROVIDER_LABELS: Record<string, string> = {
  paystack: "Card or bank",
  opay: "OPay wallet",
  bank_transfer: "Bank transfer",
};

// Said to the customer, not to us. "pending" on an order that is already paid means
// we are getting it ready, which is not what the bare word suggests.
const STATUS_LABELS: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  pending: "Being prepared",
  processing: "Being prepared",
  shipped: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/orders/mine");
        setOrders(res.data);
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="container-page py-12">
        <div className="skeleton h-10 w-52" />
        <div className="mt-10 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="animate-fade-in container-page grid place-items-center py-28 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-100">
          <Package className="w-6 h-6 text-surface-400" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-surface-900">
          We couldn't load your orders
        </h1>
        <p className="mt-2 max-w-sm text-surface-500 text-pretty">
          Please try again in a moment. If it keeps happening, get in touch and quote
          your order reference.
        </p>
        <button onClick={() => location.reload()} className="btn btn-primary mt-8">
          Try again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="animate-fade-in container-page grid place-items-center py-28 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-100">
          <Package className="w-6 h-6 text-surface-400" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-surface-900">
          No orders yet
        </h1>
        <p className="mt-2 max-w-sm text-surface-500 text-pretty">
          When you place an order it will appear here, with its status and everything
          you bought.
        </p>
        <Link to="/products" className="btn btn-primary mt-8">
          Browse products
          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="container-page py-10 sm:py-14">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-3xl font-extrabold text-surface-900 sm:text-4xl">
            Your orders
          </h1>
          <p className="text-sm text-surface-500">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-9 space-y-4">
          {orders.map((order, index) => (
            <motion.article
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] }}
              className="card overflow-hidden"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b hairline p-5 sm:px-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                      {STATUS_LABELS[order.status] ?? order.status.replace(/_/g, " ")}
                    </span>
                    {/* The payment badge only earns its place when it says something
                        the fulfilment badge does not. "paid" is the ordinary case and
                        needs no tick; an unpaid order already reads "Awaiting payment"
                        on the left, so repeating it there produced the same words
                        twice in a row. That leaves refunds, which genuinely differ. */}
                    {order.paymentStatus !== "paid" &&
                      order.status !== "awaiting_payment" && (
                        <span className={`badge capitalize ${PAYMENT_STYLES[order.paymentStatus] ?? PAYMENT_STYLES.pending}`}>
                          {order.paymentStatus === "pending" ? "Awaiting payment" : order.paymentStatus}
                        </span>
                      )}
                  </div>
                  <p className="mt-2.5 text-sm text-surface-500">
                    Placed {formatDate(order.createdAt)} · {PROVIDER_LABELS[order.paymentProvider] ?? order.paymentProvider}
                  </p>
                  <p className="mt-1 font-mono text-xs text-surface-400">
                    {order.paymentReference}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums text-surface-900">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <p className="mt-0.5 text-xs text-surface-500">
                    {order.items.reduce((n, i) => n + i.quantity, 0)} item
                    {order.items.reduce((n, i) => n + i.quantity, 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <ul className="divide-y hairline">
                {order.items.map((item, i) => {
                  const name = item.product?.name ?? item.name ?? "Item no longer available";
                  const image = item.product?.image ?? item.image;
                  return (
                    <li key={i} className="flex items-center gap-4 p-5 sm:px-6">
                      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-100">
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
                      <p className="shrink-0 text-sm tabular-nums text-surface-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
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

              {/* A transfer that has not landed yet is the one case where there is
                  something left for the customer to do, so it gets a way back. */}
              {order.paymentStatus === "pending" && order.paymentProvider === "bank_transfer" && (
                <div className="flex items-center justify-between gap-4 border-t hairline p-5 sm:px-6">
                  <p className="flex items-center gap-2 text-sm text-surface-500">
                    <Clock className="w-4 h-4 shrink-0" strokeWidth={1.75} />
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
