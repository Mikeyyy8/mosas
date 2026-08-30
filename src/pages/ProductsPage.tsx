import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
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

  const categories = ["all", ...CATEGORIES.map((c) => c.toLowerCase())];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
  };

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="border-b hairline bg-white">
        <div className="container-page py-12 sm:py-16">
          <p className="eyebrow">The collection</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-surface-900 sm:text-5xl">
            Baby essentials
          </h1>
          <p className="mt-3 max-w-lg text-surface-500 text-pretty">
            Nursery, gear, clothing, and care — chosen slowly, so you don't have to.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-[68px] z-40 border-b hairline glass">
        <div className="container-page">
          <div className="flex flex-col gap-3 py-3.5 lg:flex-row lg:items-center">
            <div className="relative lg:w-72 shrink-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" strokeWidth={1.75} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                className="field field-icon h-10"
              />
            </div>

            <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`chip shrink-0 ${selectedCategory === cat ? "chip-active" : ""}`}
                >
                  {cat === "all" ? "All" : CATEGORIES.find((c) => c.toLowerCase() === cat) || cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container-page py-10 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4 sm:gap-x-6 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[4/5]" />
                <div className="skeleton mt-4 h-3 w-16" />
                <div className="skeleton mt-2 h-4 w-3/4" />
                <div className="skeleton mt-2 h-4 w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className="mb-8 text-sm text-surface-500">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {selectedCategory !== "all" && (
                <>
                  {" "}in{" "}
                  <span className="text-surface-900">
                    {CATEGORIES.find((c) => c.toLowerCase() === selectedCategory)}
                  </span>
                </>
              )}
            </p>
            <motion.div
              layout
              className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4 sm:gap-x-6"
            >
              {filtered.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          </>
        ) : (
          <div className="grid place-items-center px-6 py-24 text-center">
            <p className="font-display text-2xl text-surface-900">Nothing matches</p>
            <p className="mt-2 max-w-sm text-sm text-surface-500 text-pretty">
              Try a different search term, or clear the filters to see the whole collection.
            </p>
            <button onClick={clearFilters} className="btn btn-secondary mt-6">
              <X className="w-4 h-4" strokeWidth={1.75} />
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
