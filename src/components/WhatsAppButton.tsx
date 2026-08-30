import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { whatsappHref } from "@/lib/contact";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 448 512"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.6-30.6-38.1-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.5 5.5-9.3 1.9-3.7.9-7-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
);

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(true);

  // No number configured means no button — a chat link that opens a conversation
  // with a stranger is worse than no chat link at all. See lib/contact.ts.
  if (!isVisible || !whatsappHref) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="group relative"
        >
          {/* Dismiss stays out of the way until the button is hovered */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute -right-1 -top-1 z-20 grid h-5 w-5 scale-75 place-items-center rounded-full border border-surface-200 bg-white text-surface-500 opacity-0 shadow-soft transition-all hover:text-surface-900 group-hover:scale-100 group-hover:opacity-100"
            aria-label="Hide WhatsApp button"
          >
            <X className="w-3 h-3" strokeWidth={2} />
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-elevated transition-transform duration-300 ease-smooth hover:scale-105 active:scale-95"
            aria-label="Chat with us on WhatsApp"
          >
            <WhatsAppIcon className="w-6 h-6" />
          </a>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppButton;

