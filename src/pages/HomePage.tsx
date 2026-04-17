import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Shield, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
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
    title: "Gentle Essentials",
    subtitle: "Curated for your little one",
    description: "Premium baby clothes designed for ultimate comfort and style. Safe, soft, and sustainable.",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80",
    color: "bg-brand-50"
  },
  {
    category: "Gear",
    title: "Safe Adventures",
    subtitle: "Quality gear for every journey",
    description: "From strollers to car seats, we provide the best gear to keep your baby safe on the go.",
    image: "https://images.unsplash.com/photo-1491013516836-7dbf43681043?w=1200&q=80",
    color: "bg-blue-50"
  },
  {
    category: "Nursery",
    title: "Dreamy Spaces",
    subtitle: "Beautiful nursery designs",
    description: "Create a peaceful sanctuary for your baby with our carefully selected nursery furniture.",
    image: "https://images.unsplash.com/photo-1555022839-843343cb43a6?w=1200&q=80",
    color: "bg-green-50"
  },
  {
    category: "Toys",
    title: "Playful Learning",
    subtitle: "Toys that inspire wonder",
    description: "Educational and fun toys that support your child's growth and imagination.",
    image: "https://images.unsplash.com/photo-1555985202-12975b0235dc?w=1200&q=80",
    color: "bg-yellow-50"
  }
];

const HomePage = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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

  const features = [
    {
      icon: Heart,
      title: "Gentle & Safe",
      description: "Every product is carefully tested for your baby's comfort and safety.",
    },
    {
      icon: Shield,
      title: "Secure Checkout",
      description: "Your payment information is always protected.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to your doorstep.",
    },
  ];

  return (
    <div className="animate-fade-in relative">
      {/* Hero Carousel */}
      <section className="relative h-[600px] sm:h-[700px] overflow-hidden bg-surface-50 dark:bg-surface-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={HERO_SLIDES[activeSlide].image}
                alt={HERO_SLIDES[activeSlide].title}
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-950/80 via-surface-950/40 to-transparent dark:from-surface-950 dark:via-surface-950/60" />
            </div>

            {/* Content */}
            <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold tracking-wider uppercase mb-6">
                    {HERO_SLIDES[activeSlide].category}
                  </span>
                  <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.05] mb-6">
                    {HERO_SLIDES[activeSlide].title}{" "}
                    <span className="text-brand-400 block sm:inline">
                      {HERO_SLIDES[activeSlide].subtitle.split(" ").slice(0, 1)}
                    </span>
                    {" "}{HERO_SLIDES[activeSlide].subtitle.split(" ").slice(1).join(" ")}
                  </h1>
                  <p className="text-xl text-surface-200 leading-relaxed mb-8 max-w-lg">
                    {HERO_SLIDES[activeSlide].description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 text-white text-sm font-semibold rounded-2xl hover:bg-brand-600 transition-all hover:scale-105 shadow-lg shadow-brand-500/20"
                    >
                      Shop Collection
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 left-10 flex gap-3 z-20">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                activeSlide === index ? "w-12 bg-brand-500" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Floating gradient */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </section>

      {/* Features */}
      <section className="border-t border-surface-200/60 dark:border-surface-800/60 bg-surface-50/50 dark:bg-surface-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-4"
              >
                <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                  <feature.icon className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h3 className="font-medium text-surface-900 dark:text-surface-100 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-surface-200/60 dark:border-surface-800/60 bg-white dark:bg-surface-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-surface-900 dark:text-surface-50">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: "Clothes", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80" },
              { name: "Gear", img: "https://images.unsplash.com/photo-1491013516836-7dbf43681043?w=500&q=80" },
              { name: "Nursery", img: "https://images.unsplash.com/photo-1555022839-843343cb43a6?w=500&q=80" },
              { name: "Toys", img: "https://images.unsplash.com/photo-1555985202-12975b0235dc?w=500&q=80" }
            ].map((cat) => (
              <Link key={cat.name} to="/products" className="group relative block overflow-hidden rounded-2xl aspect-[4/5]">
                <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-center">
                  <span className="text-white font-medium text-lg tracking-wide">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-surface-900 dark:text-surface-50">
              Featured Products
            </h2>
            <p className="mt-2 text-surface-500 dark:text-surface-400">
              Our top picks for you
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-surface-400 dark:text-surface-500">
              No featured products available yet.
            </p>
          </div>
        )}

        <div className="mt-8 sm:hidden text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400"
          >
            View all products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
