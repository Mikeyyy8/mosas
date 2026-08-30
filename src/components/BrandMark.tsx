/**
 * The MOSAS mark: a round form resting in a cupped arc.
 *
 * It replaces the stock parcel icon the header used to borrow from lucide — which
 * said "shipping", not "baby", and collided with the identical icon used for a
 * customer's orders. Drawn rather than imported so it stays crisp at any size and
 * inherits colour from whatever it sits on.
 */
const BrandMark = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {/* A shallower cradle read as a spoon at 26px, which is the size it is used
        at everywhere. A true half-circle keeps the silhouette legible small. */}
    <circle cx="12" cy="6.9" r="3.3" />
    <path d="M3.9 12.1a8.1 8.1 0 0 0 16.2 0" />
  </svg>
);

export default BrandMark;
