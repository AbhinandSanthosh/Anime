import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Heart, Search, ShoppingBag } from "lucide-react";

import Footer from "../components/Footer";
import shopHero from "../assets/shop.png";
import api from "../service/api";
import { useCart } from "../context/CartContext";

const categories = ["All", "Apparel", "Figures", "Accessories", "Wall Art"];
const PLACEHOLDER = "/products/placeholder.png";

// Change this to your next real drop date
const DROP_DATE = new Date("2026-10-20T18:00:00+05:30");

// One gradient per category tile, light violet to deep fuchsia
const TILE_BG = [
  "from-violet-300 to-violet-500",
  "from-violet-400 to-indigo-600",
  "from-fuchsia-400 to-violet-600",
  "from-fuchsia-500 to-purple-700",
  "from-pink-500 to-fuchsia-700",
];

const HALFTONE = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.28) 1.4px, transparent 1.6px)",
  backgroundSize: "9px 9px",
};

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = Math.max(0, target.getTime() - now);
  const pad = (n) => String(n).padStart(2, "0");

  return {
    done: left === 0,
    parts: [
      ["Days", pad(Math.floor(left / 86400000))],
      ["Hours", pad(Math.floor(left / 3600000) % 24)],
      ["Mins", pad(Math.floor(left / 60000) % 60)],
      ["Secs", pad(Math.floor(left / 1000) % 60)],
    ],
  };
}

const money = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function ShopPage() {
  const { addItem, items } = useCart();
  const countdown = useCountdown(DROP_DATE);

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Featured");
  const [wishlist, setWishlist] = useState([]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/products/");
        const list = Array.isArray(data)
          ? data
          : data?.products || data?.results || data?.data || [];

        setProducts(
          list.map((p) => ({
            id: p.id,
            name: p.name || "Unnamed product",
            description: p.description || "",
            category: p.category || "Other",
            price: Number(p.price) || 0,
            original_price:
              p.original_price !== null && p.original_price !== undefined
                ? Number(p.original_price)
                : null,
            image: p.image || null,
            rating: Number(p.rating) || 0,
            reviews: Number(p.reviews) || 0,
            is_new: Boolean(p.is_new),
            is_featured: Boolean(p.is_featured),
            stock: Number(p.stock) || 0,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Unable to load products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sort === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    else if (sort === "Price: High to Low") result.sort((a, b) => b.price - a.price);
    else if (sort === "Newest")
      result.sort((a, b) => Number(b.is_new) - Number(a.is_new) || b.id - a.id);
    else result.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

    return result;
  }, [products, category, search, sort]);

  const countFor = (item) =>
    item === "All"
      ? products.length
      : products.filter((p) => p.category.toLowerCase() === item.toLowerCase())
          .length;

  const cartQty = (id) => items.find((i) => i.id === id)?.quantity || 0;

  const toggleWishlist = (id) =>
    setWishlist((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );

  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER;
  };

  const seeNewDrops = () => {
    setCategory("All");
    setSort("Newest");
    document.getElementById("shop-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main className="min-h-screen bg-[#08070d] text-white">
        <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-8">
          {/* ===================== DROP BANNER ===================== */}
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.08]">
            <img
              src={shopHero}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08070d] via-[#08070d]/75 to-[#08070d]/10" />
            <div className="absolute inset-0 opacity-40" style={HALFTONE} />

            <div className="relative flex min-h-[340px] flex-col justify-end gap-8 p-6 sm:p-10 lg:min-h-[420px] lg:flex-row lg:items-end lg:justify-between lg:p-12">
              <div className="max-w-xl">
                <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl">
                  {countdown.done ? "The new drop is live." : "The next drop is almost here."}
                </h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-zinc-300">
                  Fresh figures, streetwear and wall art for fans. Be first in
                  line when it lands.
                </p>

                <button
                  type="button"
                  onClick={seeNewDrops}
                  className="mt-6 rounded-full bg-violet-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
                >
                  See what's new
                </button>
              </div>

              {!countdown.done && (
                <div className="flex items-start gap-2 sm:gap-3" aria-label="Time until the next drop">
                  {countdown.parts.map(([label, value], i) => (
                    <div key={label} className="flex items-start gap-2 sm:gap-3">
                      <div className="text-center">
                        <div className="min-w-[56px] rounded-2xl bg-white px-3 py-3 text-3xl font-black tabular-nums text-[#08070d] sm:min-w-[72px] sm:text-4xl">
                          {value}
                        </div>
                        <p className="mt-2 text-xs font-semibold text-zinc-300">{label}</p>
                      </div>
                      {i < 3 && (
                        <span className="pt-3 text-2xl font-black text-violet-400 sm:text-3xl">:</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ===================== HEADING ===================== */}
          <div className="mt-14 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-5xl font-black tracking-[-0.05em] sm:text-7xl">
              Shop all
            </h2>
            <p className="pb-2 text-sm text-zinc-400">
              <span className="font-bold text-white">{filteredProducts.length}</span>{" "}
              {filteredProducts.length === 1 ? "item" : "items"}
            </p>
          </div>

          {/* ===================== CATEGORY TILES ===================== */}
          <div className="-mx-4 mt-8 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none]">
            {categories.map((item, i) => {
              const active = category === item;
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => setCategory(item)}
                  aria-pressed={active}
                  className={`relative h-28 min-w-[150px] flex-1 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-left transition sm:h-32 ${
                    TILE_BG[i % TILE_BG.length]
                  } ${
                    active
                      ? "ring-2 ring-white ring-offset-2 ring-offset-[#08070d]"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="absolute inset-0" style={HALFTONE} />
                  <span className="relative block text-lg font-black leading-tight text-white drop-shadow">
                    {item}
                  </span>
                  <span className="relative mt-1 block text-xs font-semibold text-white/80">
                    {countFor(item)} items
                  </span>
                </button>
              );
            })}
          </div>

          {/* ===================== TOOLBAR ===================== */}
          <div
            id="shop-grid"
            className="mt-8 flex scroll-mt-24 flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="relative w-full sm:max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search anime products"
                className="h-12 w-full rounded-full border border-white/[0.08] bg-[#111018] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60"
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort products"
                className="h-12 w-full appearance-none rounded-full border border-white/[0.08] bg-[#111018] px-5 pr-11 text-sm text-zinc-300 outline-none focus:border-violet-500/60 sm:w-56"
              >
                <option>Featured</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
            </div>
          </div>

          {/* ===================== PRODUCTS ===================== */}
          <div className="py-10 lg:pb-20">
            {loading && (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
                  <p className="text-sm text-zinc-400">Loading products...</p>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-bold text-black"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <p className="text-lg font-semibold">Nothing matches that search</p>
                <p className="mt-2 text-sm text-zinc-500">
                  Try a different category or clear the search box.
                </p>
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const liked = wishlist.includes(product.id);
                  const inCart = cartQty(product.id);
                  const soldOut = product.stock === 0;
                  const maxedOut = product.stock > 0 && inCart >= product.stock;
                  const disabled = soldOut || maxedOut;

                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col rounded-3xl bg-[#111018] p-2.5 sm:p-3"
                    >
                      {/* Image sits on a pale panel so every product looks lit like a shelf display */}
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#ebe7f6]">
                        <img
                          src={product.image || PLACEHOLDER}
                          alt={product.name}
                          onError={onImgError}
                          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                            soldOut ? "opacity-50 grayscale" : ""
                          }`}
                        />

                        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                          {product.is_new && (
                            <span className="rounded-md bg-[#08070d] px-2 py-1 text-[11px] font-bold text-white">
                              New
                            </span>
                          )}
                          {soldOut && (
                            <span className="rounded-md bg-red-500 px-2 py-1 text-[11px] font-bold text-white">
                              Sold out
                            </span>
                          )}
                          {!soldOut && product.stock <= 5 && (
                            <span className="rounded-md bg-orange-400 px-2 py-1 text-[11px] font-bold text-[#08070d]">
                              {product.stock} left
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                          className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full transition ${
                            liked
                              ? "bg-violet-500 text-white"
                              : "bg-white/90 text-[#08070d] hover:bg-violet-500 hover:text-white"
                          }`}
                        >
                          <Heart size={16} fill={liked ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-4">
                        <p className="text-xs font-semibold text-violet-400">
                          {product.category}
                        </p>

                        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-bold leading-5">
                          {product.name}
                        </h3>

                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-base font-black">{money(product.price)}</span>
                          {product.original_price && (
                            <span className="text-xs text-zinc-600 line-through">
                              {money(product.original_price)}
                            </span>
                          )}
                        </div>

                        {product.rating > 0 && (
                          <p className="mt-1 text-xs text-zinc-500">
                            <span className="text-yellow-400">★ {product.rating.toFixed(1)}</span>{" "}
                            ({product.reviews})
                          </p>
                        )}

                        <div className="flex-1" />

                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => addItem(product)}
                          className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition ${
                            disabled
                              ? "cursor-not-allowed bg-zinc-800 text-zinc-600"
                              : "bg-white text-[#08070d] hover:bg-violet-500 hover:text-white"
                          }`}
                        >
                          <ShoppingBag size={16} />
                          {soldOut
                            ? "Sold out"
                            : maxedOut
                            ? "Max in cart"
                            : inCart > 0
                            ? `Add another (${inCart} in cart)`
                            : "Add to cart"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}