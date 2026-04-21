import { Mail, MapPin, Package, Phone, Send } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-surface-200/60 dark:border-surface-800/60 bg-white dark:bg-surface-950 pt-16 pb-8 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-6 h-6 text-brand-500" />
              <span className="font-display text-xl font-semibold text-surface-900 dark:text-surface-100">
                MOSAS
              </span>
            </div>
            <p className="text-surface-500 dark:text-surface-400 max-w-sm">
              Gentle essentials curated for your little one. Safe, comfortable, and beautifully designed.
            </p>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:col-span-2 lg:col-span-1">
            <div>
              <h3 className="font-medium text-surface-900 dark:text-surface-100 mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-surface-500 dark:text-surface-400">
                  <MapPin className="w-4 h-4 mt-0.5 text-brand-500" />
                  <span>Omonile bus stop, Old Akute Road, Obawole, Lagos</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-surface-500 dark:text-surface-400">
                  <Mail className="w-4 h-4 text-brand-500" />
                  <a href="mailto:hello@mosas.com" className="hover:text-brand-500 transition-colors">hello@mosas.com</a>
                </li>
                <li className="flex items-center gap-3 text-sm text-surface-500 dark:text-surface-400">
                  <Phone className="w-4 h-4 text-brand-500" />
                  <a href="tel:+1234567890" className="hover:text-brand-500 transition-colors">+1 (234) 567-890</a>
                </li>
              </ul>
            </div>

            {/* Waitlist Section */}
            <div className="w-full max-w-md">
              <h3 className="font-medium text-surface-900 dark:text-surface-100 mb-4 text-sm uppercase tracking-wider">Join our waitlist</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                Be the first to know about new arrivals and special offers.
              </p>
              <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-4 pr-12 py-2.5 text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1.5 p-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
                  aria-label="Join waitlist"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-surface-200/60 dark:border-surface-800/60 flex items-center justify-start text-base">
          <p className="text-sm text-surface-400 dark:text-surface-600 flex-1 text-center sm:text-left">
            &copy; {new Date().getFullYear()} MOSAS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
