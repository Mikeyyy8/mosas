import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import WhatsAppButton from "@/components/WhatsAppButton";

import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import AuthPage from "@/pages/AuthPage";
import CheckoutSuccessPage from "@/pages/CheckoutSuccessPage";
import BankTransferPage from "@/pages/BankTransferPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import ProfilePage from "@/pages/ProfilePage";
import OrdersPage from "@/pages/OrdersPage";
import OrderLookupPage from "@/pages/OrderLookupPage";
import NotFoundPage from "@/pages/NotFoundPage";

const App = () => {
  const { checkAuth, isCheckingAuth, user } = useAuthStore();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const adoptGuestCart = useCartStore((s) => s.adoptGuestCart);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Tracks the previous signed-in identity so the transition into an account can be
  // told apart from an ordinary re-render.
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (isCheckingAuth) return;

    const userId = user?.id ?? null;
    const justSignedIn = userId !== null && previousUserId.current === null;
    previousUserId.current = userId;

    // Someone who filled a cart signed out and then logged in expects to find it
    // still there, so it is moved onto the account before the first read.
    if (justSignedIn) {
      adoptGuestCart().finally(() => fetchCart(false));
      return;
    }

    fetchCart(false);
  }, [user, isCheckingAuth, fetchCart, adoptGuestCart]);

  if (isCheckingAuth) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-50 text-surface-400">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-surface-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/transfer/:reference" element={<BankTransferPage />} />
            <Route path="/purchase-success" element={<CheckoutSuccessPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            {/* Public: a guest has no session, so reference + email is the key. */}
            <Route path="/orders/lookup" element={<OrderLookupPage />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      {/*
        Padding and gap are set here rather than inherited from sonner. Sonner scopes
        its defaults inside :where(), which carries zero specificity so that apps can
        override them without !important — but that also means the `* { padding: 0 }`
        reset in index.css ties on specificity and wins on source order, since sonner
        injects its stylesheet ahead of ours. The result is a toast whose text sits
        flush against its own border. Everything else in sonner's rule (width, flex,
        gap) survives, because the reset only names margin, padding and box-sizing.
      */}
      <Toaster
        position="bottom-right"
        offset={24}
        toastOptions={{
          className:
            "!gap-3 !rounded-2xl !border !border-surface-200 !bg-white !px-4 !py-3.5 !text-sm !text-surface-800 !shadow-elevated",
        }}
      />
      <WhatsAppButton />
    </BrowserRouter>
  );
};

export default App;
