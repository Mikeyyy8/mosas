import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { useThrottle } from "@/hooks/useThrottle";
import LoadingSpinner from "@/components/LoadingSpinner";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const { login, signup, isLoading, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success("Welcome back!");
      } else {
        await signup(form.name, form.email, form.password);
        toast.success("Account created!");
      }
      navigate("/");
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Something went wrong");
    }
  };

  const throttledSubmit = useThrottle((e: React.FormEvent) => handleSubmit(e), 2000);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid min-h-[calc(100vh-68px)] lg:grid-cols-2">
      {/* Form */}
      <div className="flex items-center justify-center px-5 py-14 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[26rem]"
        >
          <Link to="/" className="mb-10 inline-flex items-center gap-2.5 lg:hidden">
            <BrandMark className="w-[22px] h-[22px] text-brand-600" />
            <span className="font-display text-xl font-extrabold text-surface-900">MOSAS</span>
          </Link>

          <h1 className="font-display text-[2rem] font-extrabold leading-tight text-surface-900">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-surface-500">
            {isLogin ? "Sign in to pick up where you left off." : "A few details and you're shopping."}
          </p>

          <form onSubmit={throttledSubmit} className="mt-9 space-y-5">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="label">Full name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" strokeWidth={1.75} />
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ada Nwosu"
                    required={!isLogin}
                    className="field field-icon"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" strokeWidth={1.75} />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="field field-icon"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" strokeWidth={1.75} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="field field-icon pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-surface-400 transition-colors hover:text-surface-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
              {isLoading ? <LoadingSpinner size="sm" /> : isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setForm({ name: "", email: "", password: "" });
              }}
              className="rounded font-medium text-surface-900 underline underline-offset-4 transition-colors hover:text-brand-700"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-surface-900 lg:block">
        <img
          src="https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1400&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-950 via-surface-950/70 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="inline-flex items-center gap-2.5 self-start">
            <BrandMark className="w-[26px] h-[26px] text-brand-300" />
            <span className="font-display text-[1.375rem] font-extrabold text-surface-50">MOSAS</span>
          </Link>

          <div className="max-w-md">
            <p className="font-display text-[2rem] font-medium leading-snug text-surface-50 text-balance">
              Everything for the first thousand days — chosen with the care you'd give it yourself.
            </p>
            <p className="mt-6 text-sm text-surface-400">Trusted by over 2,000 families across Nigeria</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
