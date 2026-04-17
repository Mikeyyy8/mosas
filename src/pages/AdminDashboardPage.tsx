import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  X,
  Upload,
} from "lucide-react";
import api from "@/lib/axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { useThrottle } from "@/hooks/useThrottle";

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

const CATEGORIES = ["Clothes", "Gear", "Nursery", "Toys", "Food", "Essentials", "Safety", "Bath"];

const AdminDashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    isFeatured: false,
    isOnSale: false,
    discountPercent: "0",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, analyticsRes] = await Promise.all([
        api.get("/products"),
        api.get("/analytics"),
      ]);
      setProducts(productsRes.data.products || []);
      setAnalytics(analyticsRes.data);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/products", {
        ...formData,
        price: parseFloat(formData.price),
        discountPercent: parseInt(formData.discountPercent),
      });
      toast.success("Product created");
      setShowForm(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
        isFeatured: false,
        isOnSale: false,
        discountPercent: "0",
      });
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
        prev.map((p) =>
          p._id === product._id ? { ...p, isFeatured: !p.isFeatured } : p
        )
      );
      toast.success(
        product.isFeatured ? "Removed from featured" : "Added to featured"
      );
    } catch {
      toast.error("Failed to update product");
    }
  };

  const throttledToggleFeatured = useThrottle(handleToggleFeatured, 1000);

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  const totalSales = analytics?.salesData?.[0]?.totalSales ?? 0;
  const totalOrders = analytics?.salesData?.[0]?.totalOrders ?? 0;
  const totalUsers = analytics?.userData?.[0]?.totalUsers ?? 0;

  const stats = [
    {
      label: "Total Revenue",
      value: `₦${totalSales.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-500 bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: TrendingUp,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Products",
      value: products.length,
      icon: Package,
      color: "text-brand-500 bg-brand-50 dark:bg-brand-900/20",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-surface-900 dark:text-surface-50">
              Dashboard
            </h1>
            <p className="mt-1 text-surface-500 dark:text-surface-400">
              Manage your store
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600 transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add Product"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/60 dark:border-surface-800/60 p-5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                {stat.value}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Add Product Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/60 dark:border-surface-800/60 p-6"
          >
            <h2 className="font-medium text-surface-900 dark:text-surface-100 mb-4">
              New Product
            </h2>
            <form onSubmit={throttledCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="px-4 py-2.5 text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="px-4 py-2.5 text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="" disabled>Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                step="0.01"
                className="px-4 py-2.5 text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
                className="px-4 py-2.5 text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="sm:col-span-2 px-4 py-2.5 text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
              />
              <div className="sm:col-span-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-surface-300 text-brand-500 focus:ring-brand-500"
                  />
                  Featured product
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isOnSale}
                      onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                      className="rounded border-surface-300 text-brand-500 focus:ring-brand-500"
                    />
                    On Sale
                  </label>
                  {formData.isOnSale && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-surface-600 dark:text-surface-400">Discount %</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discountPercent}
                        onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                        className="w-20 px-3 py-1.5 text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-surface-900 dark:text-surface-100 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {submitting ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Products Table */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/60 dark:border-surface-800/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200/60 dark:border-surface-800/60">
            <h2 className="font-medium text-surface-900 dark:text-surface-100">
              All Products ({products.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200/60 dark:border-surface-800/60">
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Sale
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200/60 dark:divide-surface-800/60">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-surface-100 dark:bg-surface-800"
                        />
                        <span className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate max-w-[200px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-surface-500 dark:text-surface-400 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
                        ₦{product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => throttledToggleFeatured(product)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                          product.isFeatured
                            ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                            : "bg-surface-100 dark:bg-surface-800 text-surface-500"
                        }`}
                      >
                        {product.isFeatured ? "Featured" : "Not featured"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {product.isOnSale ? (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          {product.discountPercent}% OFF
                        </span>
                      ) : (
                        <span className="text-xs text-surface-400">No Sale</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => throttledDelete(product._id)}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
