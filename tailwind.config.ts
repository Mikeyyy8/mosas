/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Soft spruce — the single identity colour. Calm rather than sweet, and
        // it doesn't gender the store the way nursery pink or blue would.
        // 500 is the lightest step that clears AA against white, so any fill
        // carrying white text starts there.
        brand: {
          50: "#f1f6f3",
          100: "#dfebe4",
          200: "#bfd7ca",
          300: "#94bca8",
          400: "#659b83",
          500: "#457c67",
          600: "#2f6353",
          700: "#244e43",
          800: "#1c3a33",
          900: "#142822",
          950: "#0c1a16",
        },
        // Apricot. Earns its place on one thing only — a markdown — so a price
        // drop is the single warm interruption on an otherwise quiet page.
        // Too light to carry small text below 700.
        accent: {
          50: "#fef6ef",
          100: "#fde8d6",
          200: "#facfa9",
          300: "#f5b27a",
          400: "#ee9450",
          500: "#de7830",
          600: "#bc5c22",
          700: "#97481d",
          800: "#6f3516",
          900: "#4a2410",
        },
        // Milk — neutrals carry a trace of the spruce so nothing reads clinical.
        surface: {
          50: "#f7f8f6",
          100: "#eef0ec",
          200: "#e0e3de",
          300: "#c8cdc6",
          400: "#9aa199",
          500: "#666d65",
          600: "#4e544d",
          700: "#3a3f39",
          800: "#262a26",
          900: "#171a17",
          950: "#0e100e",
        },
      },
      fontFamily: {
        sans: ['"Figtree"', "system-ui", "-apple-system", "sans-serif"],
        display: ['"Nunito"', '"Figtree"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.06em" }],
      },
      boxShadow: {
        // Tinted with the spruce rather than neutral black, so a card settles onto
        // the milk ground instead of casting a grey shadow across it.
        soft: "0 1px 2px 0 rgba(12,26,22,0.04), 0 1px 3px 0 rgba(12,26,22,0.05)",
        elevated: "0 2px 4px -2px rgba(12,26,22,0.05), 0 8px 20px -6px rgba(12,26,22,0.10)",
        prominent: "0 4px 8px -4px rgba(12,26,22,0.06), 0 20px 44px -12px rgba(12,26,22,0.16)",
      },
      // Nothing in a baby store has a hard corner, and that softness is the whole
      // identity here — so the radius scale is pushed well past Tailwind's default.
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
    },
  },
  plugins: [],
};
