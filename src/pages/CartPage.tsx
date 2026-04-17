import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Phone, MapPin, Building, Map as MapIcon, Hash, X, Save } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useThrottle } from "@/hooks/useThrottle";

const CartPage = () => {
  const { items, isLoading, fetchCart, removeFromCart, updateQuantity, getTotal } = useCartStore();
  const { user, updateProfile } = useAuthStore();
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (user) {
      setCheckoutData({
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
      });
    }
  }, [user]);

  const validateCheckoutData = () => {
    return (
      checkoutData.phoneNumber &&
      checkoutData.address &&
      checkoutData.city &&
      checkoutData.state &&
      checkoutData.zipCode
    );
  };

  const executeStripeCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const products = items
        .filter((item) => item.product !== null)
        .map((item) => ({
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          quantity: item.quantity,
        }));

      const res = await api.post("/payments/create-checkout-session", { products });

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCheckout = async () => {
    if (!validateCheckoutData()) {
      setShowAddressForm(true);
      return;
    }
    await executeStripeCheckout();
  };

  const throttledCheckout = useThrottle(handleCheckout, 2000);

  const handleSaveAndCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(checkoutData);
      await executeStripeCheckout();
    } catch (error: any) {
      toast.error(error || "Failed to save shipping information");
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  if (items.length === 0) {
    return (
      <div className="animate-fade-in mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="w-16 h-16 text-surface-300 dark:text-surface-700 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-3">
            Your cart is empty
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mb-8">
            Discover our collection and find something you love.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 text-sm font-medium rounded-xl hover:bg-surface-800 dark:hover:bg-surface-200 transition-colors"
          >
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="animate-fade-in relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="font-display text-3xl font-semibold text-surface-900 dark:text-surface-50 mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              if (!item.product) return null;
              const salePrice =
                item.product.isOnSale && item.product.discountPercent
                  ? item.product.price * (1 - item.product.discountPercent / 100)
                  : null;
              const price = salePrice ?? item.product.price;

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex gap-4 sm:gap-6 p-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/60 dark:border-surface-800/60"
                >
                  {/* Image */}
                  <Link
                    to={`/products/${item.product._id}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product._id}`}
                      className="font-medium text-surface-900 dark:text-surface-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                      ₦{price.toFixed(2)} each
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            item.quantity === 1
                              ? removeFromCart(item.product._id)
                              : updateQuantity(item.product._id, item.quantity - 1)
                          }
                          className="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-surface-900 dark:text-surface-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                          }
                          className="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-surface-900 dark:text-surface-100">
                          ₦{(price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/60 dark:border-surface-800/60 p-6">
              <h2 className="font-medium text-surface-900 dark:text-surface-100 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-surface-600 dark:text-surface-400">
                  <span>Subtotal</span>
                  <span>₦{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-surface-600 dark:text-surface-400">
                  <span>Shipping</span>
                  <span className="text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="h-px bg-surface-200 dark:bg-surface-800" />
                <div className="flex justify-between text-base font-semibold text-surface-900 dark:text-surface-100">
                  <span>Total</span>
                  <span>₦{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={throttledCheckout}
                disabled={isCheckingOut}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Checkout
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddressForm && (
          <AddressModal 
            data={checkoutData}
            setData={setCheckoutData}
            onClose={() => setShowAddressForm(false)}
            onSubmit={handleSaveAndCheckout}
            isLoading={isLoading || useAuthStore.getState().isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AddressModal = ({ 
  data, 
  setData, 
  onClose, 
  onSubmit, 
  isLoading 
}: { 
  data: any, 
  setData: any, 
  onClose: () => void, 
  onSubmit: (e: React.FormEvent) => void,
  isLoading: boolean 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-surface-950/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-surface-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50 font-display">Checkout Information</h2>
              <p className="text-surface-500 dark:text-surface-400 mt-1">Please provide your shipping details to proceed.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors">
              <X className="w-5 h-5 text-surface-400" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="tel"
                  required
                  value={data.phoneNumber}
                  onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                  placeholder="+234..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Street Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  required
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">City</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    required
                    value={data.city}
                    onChange={(e) => setData({ ...data, city: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">State</label>
                <div className="relative">
                  <MapIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    required
                    value={data.state}
                    onChange={(e) => setData({ ...data, state: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Zip Code</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  required
                  value={data.zipCode}
                  onChange={(e) => setData({ ...data, zipCode: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
              Save & Continue to Payment
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CartPage;
