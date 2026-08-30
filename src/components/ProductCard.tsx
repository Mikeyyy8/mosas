import { motion } from "framer-motion";
import { Plus, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { formatPrice } from "@/lib/format";
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
  /**
   * Off inside a grid that is already all featured products — repeating the word
   * on every card in a section headed "Featured products" tells the reader
   * nothing, and it crowds out the markdown badge, which does.
   */
  showFeaturedBadge?: boolean;
}

const ProductCard = ({ product, showFeaturedBadge = true }: ProductCardProps) => {
  const addToCart = useCartStore((s) => s.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const salePrice =
    product.isOnSale && product.discountPercent
      ? product.price * (1 - product.discountPercent / 100)
      : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/products/${product._id}`} className="group block">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-100">
          {imageFailed ? (
            <div className="absolute inset-0 grid place-items-center text-surface-300">
              <ImageOff className="w-7 h-7" strokeWidth={1.5} />
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
              loading="lazy"
            />
          )}

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            {product.isOnSale && product.discountPercent ? (
              <span className="badge-sale">{product.discountPercent}% off</span>
            ) : (
              <span />
            )}
            {showFeaturedBadge && product.isFeatured && (
              <span className="badge bg-white/90 text-surface-700 backdrop-blur-sm">
                Featured
              </span>
            )}
          </div>

          {/* Quick add — always reachable on touch, revealed on pointer hover */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white text-surface-900 shadow-elevated transition-all duration-300 ease-smooth hover:bg-surface-900 hover:text-white disabled:opacity-60 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdding ? <LoadingSpinner size="sm" /> : <Plus className="w-[18px] h-[18px]" strokeWidth={2} />}
          </button>
        </div>

        {/* Info */}
        <div className="pt-3.5">
          <p className="eyebrow">{product.category}</p>
          <h3 className="mt-1.5 line-clamp-1 text-[0.9375rem] font-medium text-surface-900 transition-colors group-hover:text-brand-700">
            {product.name}
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="tabular text-[0.9375rem] font-semibold text-surface-900">
              {formatPrice(salePrice ?? product.price)}
            </span>
            {salePrice && (
              <span className="tabular text-[0.8125rem] text-surface-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
