import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Shield, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/axios";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  isOnSale?: boolean;
  discountPercent?: number;
  isFeatured?: boolean;
}

const HERO_SLIDES = [
  {
    category: "Clothes",
    title: "Gentle essentials",
    subtitle: "for your little one",
    description: "Organic cotton, flat seams, and nothing that itches. Made to be worn every day and washed just as often.",
    image: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?w=1200&q=80",
  },
  {
    category: "Gear",
    title: "Safe adventures",
    subtitle: "from the first step on",
    description: "Strollers, carriers, and car seats chosen for how they handle real pavements — not showroom floors.",
    image: "https://images.unsplash.com/photo-1773672268537-21e349bc7273?w=1200&q=80",
  },
  {
    category: "Nursery",
    title: "Dreamy spaces",
    subtitle: "built to be slept in",
    description: "Solid wood, non-toxic finishes, and blackout layers. A room that quiets down when you need it to.",
    image: "https://images.unsplash.com/photo-1749703827003-8e5046941847?w=1200&q=80",
  },
  {
    category: "Toys",
    title: "Playful learning",
    subtitle: "with room to imagine",
    description: "Open-ended toys in beechwood and cotton, sized for small hands and built to survive them.",
    image: "https://images.unsplash.com/photo-1637728226029-e590a9a16c4b?w=1200&q=80",
  },
];

// One tile per category the catalogue actually stocks — the grid is 2 columns on
// mobile and 4 from md up, so eight fills exactly two rows.
const CATEGORY_TILES = [
  { name: "Clothes", img: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?w=600&q=80" },
  { name: "Gear", img: "https://images.unsplash.com/photo-1773672268537-21e349bc7273?w=600&q=80" },
  { name: "Nursery", img: "https://images.unsplash.com/photo-1749703827003-8e5046941847?w=600&q=80" },
  { name: "Toys", img: "https://images.unsplash.com/photo-1637728226029-e590a9a16c4b?w=600&q=80" },
  { name: "Food", img: "https://images.unsplash.com/photo-1627251425518-550ed68255ac?w=600&q=80" },
  { name: "Essentials", img: "https://images.unsplash.com/photo-1737044248827-52004f1583dd?w=600&q=80" },
  { name: "Safety", img: "https://images.unsplash.com/photo-1715869618915-a7bf6608d4c3?w=600&q=80" },
  { name: "Bath", img: "https://images.unsplash.com/photo-1630304566704-780606056458?w=600&q=80" },
];

const FEATURES = [
  { icon: Heart, title: "Gentle & safe", description: "Every product tested against the standards we'd want for our own." },
  { icon: Shield, title: "Secure checkout", description: "Payments encrypted end to end. Card details never touch our servers." },
  { icon: Truck, title: "Fast delivery", description: "Dispatched within 24 hours, tracked to your door across Nigeria." },
];

const HomePage = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  // The hero advances by itself, which is only acceptable while nobody is reading
  // it — so it holds under the pointer, holds while one of its own controls has
  // focus, and never starts at all for someone who asked for less motion. The
  // reduced-motion block in index.css can't cover this: it only reaches CSS
  // animations, and this is a timer.
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/products/featured");
        setFeatured(res.data.featuredProducts);
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const slide = HERO_SLIDES[activeSlide];

  return (
    <div className="animate-fade-in">
      {/* Hero — type on a calm ground, image beside it rather than beneath it */}
      <section className="bg-gradient-to-b from-brand-50 to-surface-50">
        <div className="container-page">
          <div
            className="grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-24"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            {/* Copy */}
            <div className="max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="eyebrow text-brand-700">{slide.category}</p>
                  {/* The second line used to sit at surface-400 on a near-white
                      ground — around 2.5:1, well under the 3:1 large text needs —
                      and broke to leave a single word stranded on its own line.
                      It now carries the brand colour and balances its own wrap. */}
                  <h1 className="mt-4 font-display text-[2.75rem] font-extrabold leading-[1.08] tracking-tight text-surface-900 text-balance sm:text-[3.25rem]">
                    {slide.title}
                    <span className="block text-brand-600">{slide.subtitle}</span>
                  </h1>
                  <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-surface-600 text-pretty">
                    {slide.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link to="/products" className="btn btn-lg btn-primary">
                  Shop the collection
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Link>
                <Link to="/products" className="btn btn-lg btn-secondary">
                  Browse categories
                </Link>
              </div>

              {/* Slide selector doubles as progress. The bar stays hairline-thin,
                  but the button around it is a full 44px tall — the old control
                  was 2px of tappable height, which no thumb can hit. */}
              <div className="mt-7 flex items-center">
                {HERO_SLIDES.map((item, index) => (
                  <button
                    key={item.category}
                    onClick={() => setActiveSlide(index)}
                    className="group grid h-11 place-items-center rounded-full px-1.5"
                    aria-label={`Show ${item.category}`}
                    aria-current={activeSlide === index}
                  >
                    <span
                      className={`block h-[3px] rounded-full transition-all duration-500 ease-smooth ${
                        activeSlide === index
                          ? "w-10 bg-brand-600"
                          : "w-5 bg-surface-300 group-hover:bg-surface-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              {/* Was 5:6 on desktop, which left the copy column ending a third of
                  the way up a very tall image. A square keeps the two columns
                  close to the same height, so the hero stops opening on a band of
                  empty ground beside the type. */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-4xl bg-surface-200 shadow-prominent lg:aspect-square">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={activeSlide}
                    src={slide.image}
                    alt={slide.title}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 -z-10 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Promise row */}
      <section className="border-y hairline bg-white">
        <div className="container-page">
          <div className="grid gap-10 py-12 sm:grid-cols-3 sm:gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <feature.icon className="mt-0.5 w-5 h-5 shrink-0 text-brand-600" strokeWidth={1.75} />
                <div>
                  <h3 className="text-sm font-medium text-surface-900">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-surface-500 text-pretty">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Browse</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-surface-900 sm:text-[2.5rem]">
              Shop by category
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 sm:gap-6">
          {CATEGORY_TILES.map((cat) => (
            <Link key={cat.name} to="/products" className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-100">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.05]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950/55 via-surface-950/5 to-transparent" />
                <span className="absolute bottom-4 left-4 text-[0.9375rem] font-medium text-white">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-page pb-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selected</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-surface-900 sm:text-[2.5rem]">
              Featured products
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-surface-600 transition-colors hover:text-surface-900 sm:inline-flex"
          >
            View all
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4 sm:gap-x-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[4/5]" />
                <div className="skeleton mt-4 h-3 w-16" />
                <div className="skeleton mt-2 h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4 sm:gap-x-6">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} showFeaturedBadge={false} />
            ))}
          </div>
        ) : (
          <div className="card grid place-items-center px-6 py-20 text-center">
            <p className="text-surface-600">No featured products yet</p>
            <p className="mt-1 text-sm text-surface-500">
              Featured items will appear here once they're marked in the dashboard.
            </p>
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link to="/products" className="btn btn-secondary">
            View all products
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
