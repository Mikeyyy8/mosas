import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Building, Map as MapIcon, Hash, Save, Mail } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useThrottle } from "@/hooks/useThrottle";

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
        state: user.state || "",
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

  return (
    <div className="animate-fade-in min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-surface-900 dark:text-surface-50">Account Settings</h1>
          <p className="mt-2 text-surface-500 dark:text-surface-400">Manage your profile and shipping information</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200/60 dark:border-surface-800/60 shadow-sm overflow-hidden"
        >
          <form onSubmit={throttledSubmit} className="p-8 space-y-8">
            {/* Personal Info Section */}
            <div>
              <h2 className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-500 dark:text-surface-500 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+234..."
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Info Section */}
            <div className="pt-8 border-t border-surface-100 dark:border-surface-800">
              <h2 className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-6">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. 123 Luxury Lane"
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">City</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">State / Province</label>
                  <div className="relative">
                    <MapIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Zip / Postal Code</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
