import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import api from "@/lib/axios";

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const confirmOrder = async () => {
      if (!sessionId) {
        setProcessing(false);
        return;
      }
      try {
        await api.post("/payments/checkout-success", { sessionId });
        setSuccess(true);
      } catch {
        setSuccess(false);
      } finally {
        setProcessing(false);
      }
    };
    confirmOrder();
  }, [sessionId]);

  if (processing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-surface-500">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-[60vh] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-surface-900 dark:text-surface-100 mb-3">
          {success ? "Order Confirmed!" : "Something went wrong"}
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8">
          {success
            ? "Thank you for your purchase. Your order has been placed successfully."
            : "We couldn't confirm your order. Please contact support."}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 text-sm font-medium rounded-xl hover:bg-surface-800 dark:hover:bg-surface-200 transition-colors"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccessPage;
