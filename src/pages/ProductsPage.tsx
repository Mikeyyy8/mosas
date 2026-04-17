import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Baby } from "lucide-react";
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

const CATEGORIES = ["Clothes", "Gear", "Nursery", "Toys", "Food", "Essentials", "Safety", "Bath"];

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["all", ...CATEGORIES.map(c => c.toLowerCase())];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-3">
            <Baby className="w-8 h-8 text-brand-500" />
            Baby Essentials
          </h1>
          <p className="mt-2 text-surface-500 dark:text-surface-400">
            Browse our complete collection of nursery, gear, and baby care
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal className="w-4 h-4 text-surface-400 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
                }`}
              >
                {cat === "all" ? "All" : CATEGORIES.find(c => c.toLowerCase() === cat) || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : filtered.length > 0 ? (
          <>
            <p className="text-sm text-surface-400 dark:text-surface-500 mb-6">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </p>
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-surface-500 dark:text-surface-400 text-lg">
              No products found
            </p>
            <p className="text-surface-400 dark:text-surface-500 text-sm mt-2">
              Try adjusting your search or filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
