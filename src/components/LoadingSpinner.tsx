interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-4 h-4 border-[1.5px]",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
};

// A thin ring reads calmer than a filled glyph and inherits the current text colour,
// so it works on both light surfaces and the dark primary button.
const LoadingSpinner = ({ size = "md", className = "" }: LoadingSpinnerProps) => (
  <span className={`inline-flex items-center justify-center ${className}`} role="status" aria-label="Loading">
    <span
      className={`${sizes[size]} animate-spin rounded-full border-current border-r-transparent opacity-60`}
    />
  </span>
);

export default LoadingSpinner;
