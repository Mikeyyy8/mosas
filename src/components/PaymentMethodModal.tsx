import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Wallet, Landmark, X, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatPrice } from "@/lib/format";
import {
  useCheckoutStore,
  type PaymentProvider,
  type GuestCheckout,
} from "@/stores/useCheckoutStore";

const ICONS: Record<PaymentProvider, typeof CreditCard> = {
  paystack: CreditCard,
  opay: Wallet,
  bank_transfer: Landmark,
};

const PaymentMethodModal = ({
  total,
  guest,
  onClose,
}: {
  total: number;
  /** Present only for a signed-out checkout; null when an account is driving it. */
  guest?: GuestCheckout | null;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const { methods, isLoadingMethods, isInitializing, fetchMethods, startCheckout } =
    useCheckoutStore();
  const [selected, setSelected] = useState<PaymentProvider | null>(null);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  // Preselect the first available method so the common path is one click.
  useEffect(() => {
    if (!selected && methods.length > 0) {
      setSelected(methods[0].id);
    }
  }, [methods, selected]);

  const handlePay = async () => {
    if (!selected) return;

    try {
      const order = await startCheckout(selected, guest);

      // Card and wallet checkouts have already navigated away by this point. Only
      // bank transfer returns here, with an account to display.
      if (selected === "bank_transfer") {
        navigate(`/checkout/transfer/${order.reference}`);
      }
    } catch (error: any) {
      toast.error(typeof error === "string" ? error : "Could not start payment");
    }
  };

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
        aria-labelledby="payment-title"
        className="mb-4 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-prominent sm:mb-0"
      >
        <div className="flex items-start justify-between gap-4 border-b hairline p-6 sm:px-8">
          <div>
            <h2
              id="payment-title"
              className="font-display text-2xl font-extrabold text-surface-900"
            >
              How would you like to pay?
            </h2>
            <p className="mt-1 text-sm text-surface-500">
              Paying {formatPrice(total)} — all methods are secured by the provider.
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

        <div className="p-6 sm:p-8">
          {isLoadingMethods ? (
            <div className="grid place-items-center py-10">
              <LoadingSpinner size="md" className="text-surface-400" />
            </div>
          ) : methods.length === 0 ? (
            <p className="py-8 text-center text-sm text-surface-500">
              No payment methods are available right now. Please try again shortly.
            </p>
          ) : (
            <fieldset>
              <legend className="sr-only">Payment method</legend>
              <div className="space-y-3">
                {methods.map((method) => {
                  const Icon = ICONS[method.id];
                  const active = selected === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors ${
                        active
                          ? "border-brand-600 bg-brand-50/60"
                          : "hairline hover:bg-surface-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={method.id}
                        checked={active}
                        onChange={() => setSelected(method.id)}
                        className="sr-only"
                      />
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                          active
                            ? "bg-brand-600 text-white"
                            : "bg-surface-100 text-surface-500"
                        }`}
                      >
                        <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-surface-900">
                          {method.label}
                        </span>
                        <span className="block text-sm text-surface-500">
                          {method.description}
                        </span>
                      </span>
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                          active
                            ? "border-brand-600"
                            : "border-surface-300"
                        }`}
                        aria-hidden="true"
                      >
                        {active && (
                          <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          <button
            onClick={handlePay}
            disabled={!selected || isInitializing || methods.length === 0}
            className="btn btn-primary mt-7 w-full"
          >
            {isInitializing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                Pay {formatPrice(total)}
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </>
            )}
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-surface-400">
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
            We never see or store your card details.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentMethodModal;
