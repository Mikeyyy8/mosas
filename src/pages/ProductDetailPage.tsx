import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, ImageOff, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import api from "@/lib/axios";
import { useCartStore } from "@/stores/useCartStore";
import { formatPrice } from "@/lib/format";
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

const ASSURANCES = [
  { icon: Truck, text: "Free delivery on orders over ₦50,000" },
  { icon: RotateCcw, text: "30-day returns, no questions asked" },
  { icon: ShieldCheck, text: "Safety tested and certified" },
];

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

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

  // No sign-in check. A guest's cart lives in their browser and the store handles
  // that transparently, exactly as the quick-add button on the product grid does —
  // this page was the last place still turning guests away.
  const handleAddToCart = async () => {
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
    return (
      <div className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="skeleton aspect-square rounded-3xl" />
          <div className="flex flex-col justify-center gap-4">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-9 w-3/4" />
            <div className="skeleton h-6 w-28" />
            <div className="skeleton mt-4 h-20 w-full" />
            <div className="skeleton mt-2 h-12 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page grid place-items-center py-28 text-center">
        <p className="font-display text-2xl text-surface-900">Product not found</p>
        <p className="mt-2 text-sm text-surface-500">
          It may have been removed from the collection.
        </p>
        <Link to="/products" className="btn btn-secondary mt-6">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
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
      <div className="container-page py-8 sm:py-12">
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 rounded text-sm text-surface-500 transition-colors hover:text-surface-900"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Back to products
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-square overflow-hidden rounded-3xl bg-surface-100"
          >
            {imageFailed ? (
              <div className="grid h-full place-items-center text-surface-300">
                <ImageOff className="w-9 h-9" strokeWidth={1.5} />
              </div>
            ) : (
              <img
                src={product.image}
                alt={product.name}
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover"
              />
            )}
            {product.isOnSale && product.discountPercent && (
              <span className="badge-sale absolute left-4 top-4">
                {product.discountPercent}% off
              </span>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center lg:py-4"
          >
            <p className="eyebrow">{product.category}</p>

            <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-tight text-surface-900 sm:text-[2.5rem]">
              {product.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="tabular text-2xl font-semibold text-surface-900">
                {formatPrice(salePrice ?? product.price)}
              </span>
              {salePrice && (
                <span className="tabular text-lg text-surface-500 line-through">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="mt-7 leading-relaxed text-surface-600 text-pretty">
              {product.description}
            </p>

            <button
              onClick={handleAddToCart}
              disabled={added || isAdding}
              className={`btn btn-lg mt-9 w-full sm:w-auto sm:min-w-[15rem] ${
                added ? "bg-brand-500 text-white hover:bg-brand-500" : "btn-primary"
              }`}
            >
              {isAdding ? (
                <LoadingSpinner size="sm" />
              ) : added ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2} />
                  Added to cart
                </>
              ) : (
                "Add to cart"
              )}
            </button>

            <ul className="mt-10 space-y-3 border-t hairline pt-8">
              {ASSURANCES.map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-sm text-surface-500">
                  <item.icon className="w-4 h-4 shrink-0 text-brand-600" strokeWidth={1.75} />
                  {item.text}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
