import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Building, Map as MapIcon, Hash, Mail } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { NIGERIAN_STATES, canonicalState } from "@/lib/nigeria";
import { useThrottle } from "@/hooks/useThrottle";

const PERSONAL_FIELDS = [
  { key: "name", label: "Full name", icon: User, type: "text", placeholder: "Ada Nwosu", disabled: false },
  { key: "email", label: "Email address", icon: Mail, type: "email", placeholder: "", disabled: true },
  { key: "phoneNumber", label: "Phone number", icon: Phone, type: "tel", placeholder: "+234 801 234 5678", disabled: false },
] as const;

const ADDRESS_FIELDS = [
  { key: "address", label: "Street address", icon: MapPin, type: "text", placeholder: "12 Bourdillon Road", span: true },
  { key: "city", label: "City", icon: Building, type: "text", placeholder: "Ikeja", span: false },
  { key: "state", label: "State", icon: MapIcon, type: "text", placeholder: "Lagos", span: false, control: "select" },
  { key: "zipCode", label: "Postal code", icon: Hash, type: "text", placeholder: "101233", span: false },
] as const;

const ProfilePage = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        city: user.city || "",
        state: canonicalState(user.state),
        zipCode: user.zipCode || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error || "Failed to update profile");
    }
  };

  const throttledSubmit = useThrottle((e: React.FormEvent) => handleSubmit(e), 2000);

  if (!user) return null;

  const setField = (key: string, value: string) => setFormData({ ...formData, [key]: value });

  return (
    <div className="animate-fade-in">
      <div className="container-page max-w-3xl py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Account</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-surface-900 sm:text-4xl">
              Settings
            </h1>
            <p className="mt-2 text-surface-500">
              Your details and where we should send your orders.
            </p>
          </div>
          {/* This page is only the address form; order history lives on its own page. */}
          <Link to="/orders" className="btn btn-secondary btn-sm">
            My orders
          </Link>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={throttledSubmit}
          className="mt-10"
        >
          <section>
            <h2 className="eyebrow">Personal information</h2>
            <div className="mt-5 grid grid-cols-2 gap-5">
              {PERSONAL_FIELDS.map((field) => (
                <div key={field.key} className="col-span-2 sm:col-span-1">
                  <label htmlFor={field.key} className="label">{field.label}</label>
                  <div className="relative">
                    <field.icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" strokeWidth={1.75} />
                    <input
                      id={field.key}
                      type={field.type}
                      value={formData[field.key]}
                      disabled={field.disabled}
                      placeholder={field.placeholder}
                      onChange={(e) => setField(field.key, e.target.value)}
                      className="field field-icon"
                    />
                  </div>
                  {field.disabled && (
                    <p className="mt-1.5 text-xs text-surface-400">
                      Contact support to change your email
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 border-t hairline pt-10">
            <h2 className="eyebrow">Shipping address</h2>
            <div className="mt-5 grid grid-cols-2 gap-5">
              {ADDRESS_FIELDS.map((field) => (
                <div key={field.key} className={field.span ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                  <label htmlFor={field.key} className="label">{field.label}</label>
                  <div className="relative">
                    <field.icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" strokeWidth={1.75} />
                    {"control" in field && field.control === "select" ? (
                      <select
                        id={field.key}
                        value={formData[field.key]}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="field field-icon"
                      >
                        <option value="">Choose a state</option>
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
                        value={formData[field.key]}
                        placeholder={field.placeholder}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="field field-icon"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-10 flex justify-end border-t hairline pt-8">
            <button type="submit" disabled={isLoading} className="btn btn-primary min-w-[10rem]">
              {isLoading ? <LoadingSpinner size="sm" /> : "Save changes"}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default ProfilePage;
