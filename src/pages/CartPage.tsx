import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Phone, MapPin, Building, Map as MapIcon, Hash, X, ImageOff, User as UserIcon, Mail } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import PaymentMethodModal from "@/components/PaymentMethodModal";
import { formatPrice } from "@/lib/format";
import { NIGERIAN_STATES, canonicalState } from "@/lib/nigeria";
import { useShippingStore } from "@/stores/useShippingStore";
import { toast } from "sonner";
import { useThrottle } from "@/hooks/useThrottle";

const CartPage = () => {
  const { items, isLoading, fetchCart, removeFromCart, updateQuantity, getTotal, getCheckoutItems } =
    useCartStore();
  const { user, updateProfile } = useAuthStore();
  const quote = useShippingStore((s) => s.quote);
  const fetchQuote = useShippingStore((s) => s.fetchQuote);

  // null while the customer has no saved state — the summary says so rather than
  // showing a zero that would grow into a charge one screen later.
  const shippingFee = quote?.fee ?? null;

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [checkoutData, setCheckoutData] = useState({
    // Only collected when signed out; an account supplies these itself.
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const isGuest = !user;

  useEffect(() => {
    fetchCart();
    fetchQuote();
  }, [fetchCart, fetchQuote]);

  useEffect(() => {
    if (user) {
      setCheckoutData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        city: user.city || "",
        // A profile saved before this was a dropdown may hold "lagos" or "Lagos
        // State". Matching it back to the canonical option keeps the select from
        // rendering blank and making the customer re-pick something they already set.
        state: canonicalState(user.state),
        zipCode: user.zipCode || "",
      });
    }
  }, [user]);

  const validateCheckoutData = () => {
    const addressComplete =
      checkoutData.phoneNumber &&
      checkoutData.address &&
      checkoutData.city &&
      checkoutData.state &&
      checkoutData.zipCode;

    // A guest has no profile to fall back on, so their contact details are part of
    // the same form and gate the same button.
    return isGuest
      ? addressComplete && checkoutData.name && checkoutData.email
      : addressComplete;
  };

  // Nothing about price or product identity is sent from here any more: the server
  // rebuilds the order from the stored cart, so the client cannot influence what is
  // charged. All this does is decide which screen comes next.
  const handleCheckout = () => {
    if (!validateCheckoutData()) {
      setShowAddressForm(true);
      return;
    }
    setShowPaymentModal(true);
  };

  const throttledCheckout = useThrottle(handleCheckout, 2000);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (updatingItems.has(productId)) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error: any) {
      toast.error(error || "Failed to update quantity");
    } finally {
      setTimeout(() => {
        setUpdatingItems((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 300);
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    if (updatingItems.has(productId)) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await removeFromCart(productId);
    } catch (error: any) {
      toast.error(error || "Failed to remove item");
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleSaveAndCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Nothing to save for a guest — there is no account. Their details travel with
      // the checkout request and are snapshotted onto the order.
      if (isGuest) {
        await fetchQuote(checkoutData.state);
        setShowAddressForm(false);
        setShowPaymentModal(true);
        return;
      }

      await updateProfile(checkoutData);
      // The saved state decides the zone, so the fee has to be re-quoted before the
      // payment modal shows a total. Awaited rather than fired off, so the customer
      // never sees the old figure on the screen that asks them to pay.
      await fetchQuote();
      setShowAddressForm(false);
      setShowPaymentModal(true);
    } catch (error: any) {
      toast.error(error || "Failed to save shipping information");
    }
  };

  if (isLoading) {
    return (
      <div className="container-page py-12">
        <div className="skeleton h-10 w-52" />
        <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-3 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
          <div className="skeleton h-64" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="animate-fade-in container-page grid place-items-center py-28 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-100">
          <ShoppingBag className="w-6 h-6 text-surface-400" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-surface-900">
          Your cart is empty
        </h1>
        <p className="mt-2 max-w-sm text-surface-500 text-pretty">
          Once you add something you love, it will show up here.
        </p>
        <Link to="/products" className="btn btn-primary mt-8">
          Browse products
          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
        </Link>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="animate-fade-in">
      <div className="container-page py-10 sm:py-14">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-3xl font-extrabold text-surface-900 sm:text-4xl">
            Your cart
          </h1>
          <p className="text-sm text-surface-500">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-14">
          {/* Line items */}
          <div className="lg:col-span-2">
            <ul className="divide-y hairline border-y hairline">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  if (!item.product) return null;
                  const salePrice =
                    item.product.isOnSale && item.product.discountPercent
                      ? item.product.price * (1 - item.product.discountPercent / 100)
                      : null;
                  const price = salePrice ?? item.product.price;
                  const busy = updatingItems.has(item.product._id);

                  return (
                    <motion.li
                      key={item._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex gap-4 py-5 transition-opacity sm:gap-6 ${busy ? "opacity-50" : ""}`}
                    >
                      <Link
                        to={`/products/${item.product._id}`}
                        className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-100 sm:h-28 sm:w-24"
                      >
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full place-items-center text-surface-300">
                            <ImageOff className="w-5 h-5" strokeWidth={1.5} />
                          </span>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link
                              to={`/products/${item.product._id}`}
                              className="line-clamp-1 rounded font-medium text-surface-900 transition-colors hover:text-brand-700"
                            >
                              {item.product.name}
                            </Link>
                            <p className="mt-0.5 text-sm text-surface-500">
                              {formatPrice(price)} each
                            </p>
                          </div>
                          <span className="shrink-0 font-semibold text-surface-900">
                            {formatPrice(price * item.quantity)}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border hairline">
                            <button
                              onClick={() =>
                                item.quantity === 1
                                  ? handleRemoveFromCart(item.product._id)
                                  : handleUpdateQuantity(item.product._id, item.quantity - 1)
                              }
                              disabled={busy}
                              className="grid h-8 w-8 place-items-center rounded-l-lg text-surface-600 transition-colors hover:bg-surface-100 disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                            </button>
                            <span className="w-9 text-center text-sm font-medium tabular-nums text-surface-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                              disabled={busy}
                              className="grid h-8 w-8 place-items-center rounded-r-lg text-surface-600 transition-colors hover:bg-surface-100 disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveFromCart(item.product._id)}
                            disabled={busy}
                            className="grid h-8 w-8 place-items-center rounded-lg text-surface-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded text-sm text-surface-500 transition-colors hover:text-surface-900"
            >
              Continue shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-[92px] p-6">
              <h2 className="font-display text-xl font-extrabold text-surface-900">
                Order summary
              </h2>

              <dl className="mt-6 space-y-3.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-surface-500">Subtotal</dt>
                  <dd className="tabular-nums text-surface-900">{formatPrice(total)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-surface-500">
                    Shipping
                    {quote?.zoneName && (
                      <span className="ml-1.5 text-surface-400">
                        ({quote.zoneName})
                      </span>
                    )}
                  </dt>
                  <dd className="text-right">
                    {shippingFee === null ? (
                      <span className="text-surface-400">
                        Calculated at checkout
                      </span>
                    ) : shippingFee === 0 ? (
                      <span className="text-green-700">Free</span>
                    ) : (
                      <span className="tabular-nums text-surface-900">
                        {formatPrice(shippingFee)}
                      </span>
                    )}
                  </dd>
                </div>
                <div className="border-t hairline pt-3.5">
                  <div className="flex items-baseline justify-between">
                    <dt className="font-medium text-surface-900">Total</dt>
                    <dd className="text-lg font-semibold tabular-nums text-surface-900">
                      {formatPrice(total + (shippingFee ?? 0))}
                    </dd>
                  </div>
                </div>
              </dl>

              <button onClick={throttledCheckout} className="btn btn-primary mt-7 w-full">
                Checkout
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </button>

              <p className="mt-4 text-center text-xs text-surface-400">
                Card, bank transfer or OPay — chosen at the next step
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddressForm && (
          <AddressModal
            data={checkoutData}
            setData={setCheckoutData}
            isGuest={isGuest}
            onClose={() => setShowAddressForm(false)}
            onSubmit={handleSaveAndCheckout}
            isLoading={isLoading || useAuthStore.getState().isLoading}
          />
        )}
        {showPaymentModal && (
          <PaymentMethodModal
            total={total + (shippingFee ?? 0)}
            guest={
              isGuest
                ? {
                    contact: { name: checkoutData.name, email: checkoutData.email },
                    address: {
                      phoneNumber: checkoutData.phoneNumber,
                      address: checkoutData.address,
                      city: checkoutData.city,
                      state: checkoutData.state,
                      zipCode: checkoutData.zipCode,
                    },
                    items: getCheckoutItems(),
                  }
                : null
            }
            onClose={() => setShowPaymentModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// State is a select rather than a text field because the delivery fee is looked up
// from it. Free text would mean "Ikeja", "lagos state" and a typo each resolve to a
// different price than the customer expects, and the server rejects anything it
// cannot match anyway.
// Name and email are only asked of guests — an account already has both. They sit at
// the top of the same form so a signed-out checkout is still one dialog, not two.
const GUEST_FIELDS = [
  { key: "name", label: "Full name", icon: UserIcon, type: "text", placeholder: "Ada Okafor", span: true, control: "input" },
  { key: "email", label: "Email", icon: Mail, type: "email", placeholder: "you@example.com", span: true, control: "input" },
] as const;

const FIELDS = [
  { key: "phoneNumber", label: "Phone number", icon: Phone, type: "tel", placeholder: "+234 801 234 5678", span: true, control: "input" },
  { key: "address", label: "Street address", icon: MapPin, type: "text", placeholder: "12 Bourdillon Road", span: true, control: "input" },
  { key: "city", label: "City", icon: Building, type: "text", placeholder: "Ikeja", span: false, control: "input" },
  { key: "state", label: "State", icon: MapIcon, type: "text", placeholder: "Lagos", span: false, control: "select" },
  { key: "zipCode", label: "Postal code", icon: Hash, type: "text", placeholder: "101233", span: false, control: "input" },
] as const;

const AddressModal = ({
  data,
  setData,
  isGuest,
  onClose,
  onSubmit,
  isLoading,
}: {
  data: any;
  setData: any;
  isGuest: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) => {
  return (
    <motion.div
      initial={{ backgroundColor: "rgba(12, 26, 22, 0)" }}
      animate={{ backgroundColor: "rgba(12, 26, 22, 0.6)" }}
      exit={{ backgroundColor: "rgba(12, 26, 22, 0)" }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end justify-center px-4 sm:items-center"
    >
      <motion.div
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipping-title"
        className="mb-4 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-prominent sm:mb-0"
      >
        <div className="flex items-start justify-between gap-4 border-b hairline p-6 sm:px-8">
          <div>
            <h2 id="shipping-title" className="font-display text-2xl font-extrabold text-surface-900">
              Shipping details
            </h2>
            <p className="mt-1 text-sm text-surface-500">
              {isGuest
                ? "We'll use these to deliver your order and to reach you about it."
                : "We'll save these to your account for next time."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="-mr-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-900"
            aria-label="Close"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 sm:p-8">
          {isGuest && (
            <p className="mb-5 rounded-xl bg-surface-50 px-4 py-3 text-[0.8125rem] leading-relaxed text-surface-500">
              No account needed. Already have one?{" "}
              <Link to="/auth" className="text-surface-900 underline underline-offset-4">
                Sign in
              </Link>{" "}
              to use your saved details.
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            {[...(isGuest ? GUEST_FIELDS : []), ...FIELDS].map((field) => (
              <div key={field.key} className={field.span ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                <label htmlFor={field.key} className="label">{field.label}</label>
                <div className="relative">
                  <field.icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" strokeWidth={1.75} />
                  {field.control === "select" ? (
                    <select
                      id={field.key}
                      required
                      value={data[field.key]}
                      onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                      className="field field-icon"
                    >
                      <option value="" disabled>
                        Choose a state
                      </option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.key}
                      type={field.type}
                      required
                      value={data[field.key]}
                      onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="field field-icon"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary mt-7 w-full">
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : isGuest ? (
              "Continue to payment"
            ) : (
              "Save and continue"
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CartPage;
