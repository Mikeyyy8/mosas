import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";
import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

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

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);
  const [isAdding, setIsAdding] = useState(false);

  const salePrice =
    product.isOnSale && product.discountPercent
      ? product.price * (1 - product.discountPercent / 100)
      : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(product._id);
      toast.success("Added to cart");
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/products/${product._id}`}
        className="group block bg-white dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-200/60 dark:border-surface-800/60 shadow-soft hover:shadow-elevated transition-all duration-300"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-800">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {product.isOnSale && product.discountPercent && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              -{product.discountPercent}%
            </span>
          )}
          {product.isFeatured && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-brand-500 text-white text-xs font-semibold rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="font-medium text-surface-900 dark:text-surface-100 mb-2 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                ₦{(salePrice ?? product.price).toFixed(2)}
              </span>
              {salePrice && (
                <span className="text-sm text-surface-400 line-through">
                  ₦{product.price.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-brand-500 hover:text-white transition-all duration-200 disabled:opacity-50"
              aria-label={`Add ${product.name} to cart`}
            >
              {isAdding ? <LoadingSpinner size="sm" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
