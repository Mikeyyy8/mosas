import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Package,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import BrandMark from "@/components/BrandMark";
import { toast } from "sonner";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
];

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The header only earns its border once content sits behind it
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setMobileOpen(false);
    }
  };

  const initials = user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header
      className={`sticky top-0 z-50 w-full glass transition-shadow duration-300 border-b ${
        scrolled ? "hairline shadow-soft" : "border-transparent"
      }`}
    >
      <div className="container-page">
        <div className="relative flex h-[68px] items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg"
            onClick={() => setMobileOpen(false)}
          >
            <BrandMark className="w-[26px] h-[26px] text-brand-600" />
            <span className="font-display text-[1.375rem] font-extrabold text-surface-900">
              MOSAS
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `relative py-1 text-sm transition-colors duration-200 ${
                    isActive
                      ? "font-medium text-surface-900"
                      : "text-surface-500 hover:text-surface-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-brand-600"
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {user?.role === "admin" && (
              <Link to="/admin" className="hidden md:inline-flex btn btn-sm btn-ghost">
                <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
                Dashboard
              </Link>
            )}

            {/*
              Shown to everyone, not just signed-in customers. Guests can fill a
              cart and check out, so hiding this left them with items added and no
              way back to them short of typing the URL.
            */}
            <Link
              to="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.75} />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-brand-600 text-white text-[10px] font-semibold leading-none rounded-full grid place-items-center ring-2 ring-surface-50"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-1 pl-1">
                <Link
                  to="/orders"
                  className="grid h-10 w-10 place-items-center rounded-full text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
                  aria-label="My orders"
                  title="My orders"
                >
                  <Package className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 transition-colors hover:bg-surface-100"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-[0.6875rem] font-semibold text-brand-700">
                    {initials}
                  </span>
                  <span className="text-sm text-surface-700 max-w-[9rem] truncate">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="grid h-10 w-10 place-items-center rounded-full text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
                  aria-label="Sign out"
                >
                  <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1 pl-1">
                <Link to="/orders/lookup" className="btn btn-sm btn-ghost">
                  Track order
                </Link>
                <Link to="/auth" className="btn btn-sm btn-primary ml-1">
                  Sign in
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden grid h-10 w-10 place-items-center rounded-full text-surface-600 transition-colors hover:bg-surface-100"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t hairline glass overflow-hidden"
          >
            <nav className="container-page py-3">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-2xl px-3 py-3 text-sm transition-colors ${
                      isActive
                        ? "bg-surface-100 font-medium text-surface-900"
                        : "text-surface-600 hover:bg-surface-100"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl px-3 py-3 text-sm text-surface-600 transition-colors hover:bg-surface-100"
                >
                  Dashboard
                </Link>
              )}

              <div className="my-2 border-t hairline" />

              {user ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-3 py-3 text-sm text-surface-600 transition-colors hover:bg-surface-100"
                  >
                    My orders
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-3 py-3 text-sm text-surface-600 transition-colors hover:bg-surface-100"
                  >
                    Account settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-2xl px-3 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/orders/lookup"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-3 py-3 text-sm text-surface-600 transition-colors hover:bg-surface-100"
                  >
                    Track an order
                  </Link>
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn btn-primary w-full mt-1">
                    Sign in
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
