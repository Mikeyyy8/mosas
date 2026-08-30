import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, ClipboardList, Package } from "lucide-react";
import api from "@/lib/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatPrice, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { useThrottle } from "@/hooks/useThrottle";
import ImageUploadField from "@/components/ImageUploadField";
import ShippingZonesPanel from "@/components/ShippingZonesPanel";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  isFeatured: boolean;
  isOnSale: boolean;
  discountPercent: number;
}

interface Analytics {
  salesData: { totalSales: number; totalOrders: number }[];
  userData: { totalUsers: number }[];
  dailySalesData: { _id: string; totalSales: number; totalOrders: number }[];
}

interface OrderItem {
  product: { _id: string; name: string; price: number; image: string };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  // Null for a guest checkout — `guest` carries the contact details instead.
  user: { _id: string; name: string; email: string } | null;
  guest: { name: string; email: string; phoneNumber?: string } | null;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: "pending" | "paid" | "failed" | "expired" | "refunded";
  paymentProvider: "paystack" | "opay" | "bank_transfer";
  paymentReference: string;
  createdAt: string;
}

const CATEGORIES = ["Clothes", "Gear", "Nursery", "Toys", "Food", "Essentials", "Safety", "Bath"];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  image: "",
  imageKey: "",
  category: "",
  isFeatured: false,
  isOnSale: false,
  discountPercent: "0",
};

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
  failed: "",
  expired: "",
  refunded: "",
};

const PROVIDER_LABELS: Record<string, string> = {
  paystack: "Paystack",
  opay: "OPay",
  bank_transfer: "Transfer",
};

// The server rejects anything else, and refuses to move an unpaid order past cancelled.
const FULFILMENT_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "shipping">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, analyticsRes, ordersRes] = await Promise.all([
        api.get("/products"),
        api.get("/analytics"),
        api.get("/orders"),
      ]);
      setProducts(productsRes.data.products || []);
      setAnalytics(analyticsRes.data);
      // The orders endpoint is paginated, so the list lives under `orders`.
      setOrders(ordersRes.data.orders || []);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const previous = orders;
    setUpdatingOrder(orderId);
    // Optimistic, because the dropdown snapping back on a slow network reads as a
    // failure even when the write succeeds.
    setOrders((current) =>
      current.map((order) => (order._id === orderId ? { ...order, status } : order))
    );

    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Order marked ${status}`);
    } catch (error: any) {
      setOrders(previous);
      toast.error(error.response?.data?.message || "Could not update order");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    // the upload field is not a native input, so `required` cannot cover it
    if (!formData.image) {
      toast.error("Please upload a product image");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/products", {
        ...formData,
        price: parseFloat(formData.price),
        discountPercent: parseInt(formData.discountPercent),
      });
      toast.success("Product created");
      setShowForm(false);
      setFormData(EMPTY_FORM);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const throttledCreate = useThrottle((e: React.FormEvent) => handleCreateProduct(e), 2000);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const throttledDelete = useThrottle(handleDelete, 1000);

  const handleToggleFeatured = async (product: Product) => {
    try {
      await api.put(`/products/${product._id}`, {
        isFeatured: !product.isFeatured,
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isFeatured: !p.isFeatured } : p))
      );
      toast.success(product.isFeatured ? "Removed from featured" : "Added to featured");
    } catch {
      toast.error("Failed to update product");
    }
  };

  const throttledToggleFeatured = useThrottle(handleToggleFeatured, 1000);

  if (loading) {
    return (
      <div className="container-page py-12">
        <div className="skeleton h-10 w-56" />
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28" />
          ))}
        </div>
        <div className="skeleton mt-8 h-96" />
      </div>
    );
  }

  const totalSales = analytics?.salesData?.[0]?.totalSales ?? 0;
  const totalOrders = analytics?.salesData?.[0]?.totalOrders ?? 0;
  const totalUsers = analytics?.userData?.[0]?.totalUsers ?? 0;

  const stats = [
    { label: "Revenue", value: formatPrice(totalSales) },
    { label: "Orders", value: totalOrders },
    { label: "Customers", value: totalUsers },
    { label: "Products", value: products.length },
  ];

  return (
    <div className="animate-fade-in">
      <div className="container-page py-10 sm:py-14">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-surface-900 sm:text-4xl">
              Dashboard
            </h1>
          </div>
          {activeTab === "products" && (
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? <X className="w-4 h-4" strokeWidth={1.75} /> : <Plus className="w-4 h-4" strokeWidth={2} />}
              {showForm ? "Cancel" : "Add product"}
            </button>
          )}
        </div>

        {/* Stats — the numbers are the point, so nothing competes with them */}
        <div className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline bg-surface-200 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-5 sm:p-6">
              <p className="eyebrow">{stat.label}</p>
              <p className="mt-2.5 font-display text-[1.75rem] font-extrabold tabular-nums leading-none text-surface-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-10 flex items-center gap-7 border-b hairline">
          {(["products", "orders", "shipping"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative -mb-px flex items-center gap-2 border-b-2 pb-3 text-sm capitalize transition-colors ${
                activeTab === tab
                  ? "border-surface-900 font-medium text-surface-900"
                  : "border-transparent text-surface-500 hover:text-surface-900"
              }`}
            >
              {tab}
              {/* Shipping is a settings screen, not a collection — a count would be
                  meaningless next to it. */}
              {tab !== "shipping" && (
                <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs tabular-nums text-surface-600">
                  {tab === "products" ? products.length : orders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "products" && (
          <>
            {/* New product */}
            <AnimatePresence initial={false}>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <form onSubmit={throttledCreate} className="card mt-8 p-6 sm:p-8">
                    <h2 className="font-display text-xl font-extrabold text-surface-900">
                      New product
                    </h2>

                    <div className="mt-6 grid grid-cols-2 gap-5">
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="p-name" className="label">Product name</label>
                        <input
                          id="p-name"
                          type="text"
                          placeholder="Organic cotton bodysuit"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="field"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="p-category" className="label">Category</label>
                        <select
                          id="p-category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                          className="field"
                        >
                          <option value="" disabled>Select a category</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="p-price" className="label">Price (₦)</label>
                        <input
                          id="p-price"
                          type="number"
                          placeholder="18500"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                          className="field"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <ImageUploadField
                          value={formData.image}
                          onUploaded={(url, key) => setFormData({ ...formData, image: url, imageKey: key })}
                          onCleared={() => setFormData({ ...formData, image: "", imageKey: "" })}
                        />
                      </div>

                      <div className="col-span-2">
                        <label htmlFor="p-desc" className="label">Description</label>
                        <textarea
                          id="p-desc"
                          placeholder="What makes this worth buying?"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          rows={3}
                          className="field"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 border-t hairline pt-6">
                      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-surface-600">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500/40"
                        />
                        Featured
                      </label>

                      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-surface-600">
                        <input
                          type="checkbox"
                          checked={formData.isOnSale}
                          onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                          className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500/40"
                        />
                        On sale
                      </label>

                      {formData.isOnSale && (
                        <div className="flex items-center gap-2.5">
                          <label htmlFor="p-discount" className="text-sm text-surface-600">
                            Discount %
                          </label>
                          <input
                            id="p-discount"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.discountPercent}
                            onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                            className="field h-9 w-20"
                          />
                        </div>
                      )}

                      <button type="submit" disabled={submitting} className="btn btn-primary ml-auto min-w-[9rem]">
                        {submitting ? <LoadingSpinner size="sm" /> : "Create product"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products table */}
            <div className="card mt-8 overflow-hidden">
              {products.length === 0 ? (
                <EmptyState icon={Package} title="No products yet" body="Add your first product to see it here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b hairline">
                        <th className="px-6 py-3.5 text-left"><span className="eyebrow">Product</span></th>
                        <th className="px-6 py-3.5 text-left"><span className="eyebrow">Category</span></th>
                        <th className="px-6 py-3.5 text-right"><span className="eyebrow">Price</span></th>
                        <th className="px-6 py-3.5 text-left"><span className="eyebrow">Featured</span></th>
                        <th className="px-6 py-3.5 text-left"><span className="eyebrow">Sale</span></th>
                        <th className="px-6 py-3.5 text-right"><span className="eyebrow sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y hairline">
                      {products.map((product) => (
                        <tr key={product._id} className="transition-colors hover:bg-surface-50">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-lg bg-surface-100 object-cover"
                              />
                              <span className="max-w-[16rem] truncate font-medium text-surface-900">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 capitalize text-surface-500">
                            {product.category}
                          </td>
                          <td className="px-6 py-3.5 text-right tabular-nums text-surface-900">
                            {formatPrice(product.price)}
                          </td>
                          <td className="px-6 py-3.5">
                            <button
                              onClick={() => throttledToggleFeatured(product)}
                              className={`badge transition-colors ${
                                product.isFeatured
                                  ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
                                  : "bg-surface-100 text-surface-500 hover:bg-surface-200"
                              }`}
                            >
                              {product.isFeatured ? "Featured" : "Not featured"}
                            </button>
                          </td>
                          <td className="px-6 py-3.5">
                            {product.isOnSale ? (
                              <span className="badge bg-red-100 text-red-800">
                                {product.discountPercent}% off
                              </span>
                            ) : (
                              <span className="text-surface-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              onClick={() => throttledDelete(product._id)}
                              className="grid h-8 w-8 place-items-center rounded-lg text-surface-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <div className="card mt-8 overflow-hidden">
            {orders.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No orders yet" body="Orders will appear here as customers check out." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b hairline">
                      <th className="px-6 py-3.5 text-left"><span className="eyebrow">Order</span></th>
                      <th className="px-6 py-3.5 text-left"><span className="eyebrow">Customer</span></th>
                      <th className="px-6 py-3.5 text-left"><span className="eyebrow">Date</span></th>
                      <th className="px-6 py-3.5 text-right"><span className="eyebrow">Total</span></th>
                      <th className="px-6 py-3.5 text-left"><span className="eyebrow">Payment</span></th>
                      <th className="px-6 py-3.5 text-right"><span className="eyebrow">Items</span></th>
                      <th className="px-6 py-3.5 text-left"><span className="eyebrow">Fulfilment</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y hairline">
                    {orders.map((order) => (
                      <tr key={order._id} className="transition-colors hover:bg-surface-50">
                        <td className="px-6 py-3.5 font-mono text-xs text-surface-500">
                          {order._id.slice(-8)}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="block font-medium text-surface-900">
                            {order.user?.name || order.guest?.name || "Unknown user"}
                          </span>
                          <span className="block text-xs text-surface-500">
                            {order.user?.email || order.guest?.email || "No email"}
                          </span>
                          {/* Worth flagging: there is no account behind this one, so
                              the address on the order is the only record of them. */}
                          {!order.user && order.guest && (
                            <span className="mt-1 inline-block rounded bg-surface-100 px-1.5 py-0.5 text-[0.6875rem] font-medium text-surface-500">
                              Guest
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-surface-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-3.5 text-right tabular-nums font-medium text-surface-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className={`badge capitalize ${PAYMENT_STYLES[order.paymentStatus] ?? "bg-surface-100 text-surface-600"}`}>
                            {order.paymentStatus}
                          </span>
                          <span className="mt-1 block text-xs text-surface-500">
                            {PROVIDER_LABELS[order.paymentProvider] ?? order.paymentProvider}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right tabular-nums text-surface-500">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td className="px-6 py-3.5">
                          {order.paymentStatus === "paid" ? (
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              disabled={updatingOrder === order._id}
                              aria-label={`Fulfilment status for order ${order._id.slice(-8)}`}
                              className="field !py-1.5 !text-xs capitalize disabled:opacity-50"
                            >
                              {FULFILMENT_OPTIONS.map((option) => (
                                <option key={option} value={option} className="capitalize">
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`badge capitalize ${STATUS_STYLES[order.status] ?? "bg-surface-100 text-surface-600"}`}>
                              {order.status.replace(/_/g, " ")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "shipping" && <ShippingZonesPanel />}
      </div>
    </div>
  );
};

const EmptyState = ({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Package;
  title: string;
  body: string;
}) => (
  <div className="grid place-items-center px-6 py-20 text-center">
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-100">
      <Icon className="w-5 h-5 text-surface-400" strokeWidth={1.5} />
    </div>
    <p className="mt-4 font-medium text-surface-900">{title}</p>
    <p className="mt-1 text-sm text-surface-500">{body}</p>
  </div>
);

export default AdminDashboardPage;
