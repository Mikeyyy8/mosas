import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import { storeAddress, storeEmail, storePhone, storePhoneHref } from "@/lib/contact";

const Footer = () => {
  return (
    <footer className="mt-auto border-t hairline bg-white">
      <div className="container-page">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-16">
          {/* Brand */}
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <BrandMark className="w-[26px] h-[26px] text-brand-600" />
              <span className="font-display text-[1.375rem] font-extrabold text-surface-900">
                MOSAS
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-surface-500 text-pretty">
              Gentle essentials curated for your little one. Safe, comfortable, and beautifully made.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="eyebrow">Contact</h3>
            <ul className="mt-5 space-y-3.5">
              <li className="flex items-start gap-3 text-sm text-surface-500">
                <MapPin className="mt-0.5 w-4 h-4 shrink-0 text-surface-400" strokeWidth={1.75} />
                <span>{storeAddress}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 shrink-0 text-surface-400" strokeWidth={1.75} />
                <a
                  href={`mailto:${storeEmail}`}
                  className="rounded text-surface-500 transition-colors hover:text-surface-900"
                >
                  {storeEmail}
                </a>
              </li>
              {storePhoneHref && (
                <li className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 shrink-0 text-surface-400" strokeWidth={1.75} />
                  <a
                    href={storePhoneHref}
                    className="rounded text-surface-500 transition-colors hover:text-surface-900"
                  >
                    {storePhone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Waitlist */}
          <div>
            <h3 className="eyebrow">Join our waitlist</h3>
            <p className="mt-5 text-sm leading-relaxed text-surface-500 text-pretty">
              First look at new arrivals and seasonal offers. No more than one email a month.
            </p>
            <form className="mt-5 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="waitlist" className="sr-only">Email address</label>
              <input
                id="waitlist"
                type="email"
                placeholder="you@example.com"
                required
                className="field h-10 flex-1 bg-surface-50"
              />
              <button type="submit" className="btn btn-sm btn-primary h-10 px-3" aria-label="Join waitlist">
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t hairline py-7 sm:flex-row">
          <p className="text-sm text-surface-400">
            &copy; {new Date().getFullYear()} MOSAS. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-surface-400">
            <Link to="/products" className="rounded transition-colors hover:text-surface-700">
              Shop
            </Link>
            <a href="mailto:hello@mosas.com" className="rounded transition-colors hover:text-surface-700">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
