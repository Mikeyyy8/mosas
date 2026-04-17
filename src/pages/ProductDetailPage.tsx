import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Check } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  isOnSale?: boolean;
  discountPercent?: number;
  isFeatured?: boolean;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    if (!product) return;
    setIsAdding(true);
    try {
      await addToCart(product._id);
      setAdded(true);
      toast.success("Added to cart");
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-surface-500 text-lg">Product not found</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 mt-4 text-brand-600 hover:text-brand-700 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
      </div>
    );
  }

  const salePrice =
    product.isOnSale && product.discountPercent
      ? product.price * (1 - product.discountPercent / 100)
      : null;

  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back link */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="aspect-square rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <p className="text-sm font-medium text-brand-500 uppercase tracking-wider mb-3">
              {product.category}
            </p>

            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-surface-900 dark:text-surface-50 tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
                ₦{(salePrice ?? product.price).toFixed(2)}
              </span>
              {salePrice && (
                <span className="text-lg text-surface-400 line-through">
                  ₦{product.price.toFixed(2)}
                </span>
              )}
              {product.isOnSale && product.discountPercent && (
                <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-full">
                  -{product.discountPercent}% off
                </span>
              )}
            </div>

            <div className="w-12 h-px bg-surface-200 dark:bg-surface-800 my-6" />

            <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
              {product.description}
            </p>

            <button
              onClick={handleAddToCart}
              disabled={added || isAdding}
              className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 hover:bg-surface-800 dark:hover:bg-surface-200"
              } disabled:opacity-50`}
            >
              {isAdding ? (
                <LoadingSpinner size="sm" />
              ) : added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
