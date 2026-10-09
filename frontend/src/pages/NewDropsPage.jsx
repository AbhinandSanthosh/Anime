import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Heart, ShoppingBag, Sparkles } from "lucide-react";

import Footer from "../components/Footer";
import newDropsHero from "../assets/new-drops.png";
import api from "../service/api";
import { useCart } from "../context/CartContext";

const PLACEHOLDER = "/products/placeholder.png";
const money = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function NewDropsPage({ onNavigate }) {
  const { addItem, items } = useCart();

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
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
        console.error("Failed to load new drops:", err);
        setError("Unable to load new drops.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Only products marked "new arrival", newest first
  const newDrops = useMemo(
    () => products.filter((p) => p.is_new).sort((a, b) => b.id - a.id),
    [products]
  );

  const cartQty = (id) => items.find((i) => i.id === id)?.quantity || 0;

  const toggleWishlist = (id) =>
    setWishlist((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );

  const goToShop = (event) => {
    event.preventDefault();
    if (onNavigate) onNavigate("/shop");
    else window.location.assign("/shop");
  };

  const badgeFor = (product, index) => {
    if (product.stock === 0) return "SOLD OUT";
    if (index === 0) return "JUST DROPPED";
    if (product.stock <= 5) return "LIMITED";
    return "NEW";
  };

  return (
    <>
      <main className="min-h-screen bg-[#08070d] text-white">

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/[0.06]">

          <img
            src={newDropsHero}
            alt="Anime new drops"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark only on the text side, so the character on the right stays bright */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08070d] via-[#08070d]/80 to-transparent sm:via-[#08070d]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08070d] via-transparent to-transparent" />

          <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-28">

            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-violet-300">
              ANIMORA / NEW DROPS
            </p>

            <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-white [text-shadow:0_4px_28px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-8xl">
              FRESH
              <span className="block text-violet-400">
                DROPS.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm font-medium leading-7 text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.9)] sm:text-base">
              Discover the latest anime-inspired pieces,
              collectibles and streetwear added to ANIMORA.
            </p>

            <div className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-zinc-200 [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
              <Sparkles size={15} className="text-violet-300" />
              New products added regularly
            </div>

          </div>
        </section>

        {/* NEW DROPS */}
        <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-10 lg:py-20">

          <div className="mb-10 flex items-end justify-between">

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400">
                JUST ARRIVED
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                New Drops
              </h2>
            </div>

            {!loading && !error && (
              <span className="hidden text-sm text-zinc-500 sm:block">
                {newDrops.length} New {newDrops.length === 1 ? "Product" : "Products"}
              </span>
            )}

          </div>

          {/* LOADING */}
          {loading && (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl border border-white/[0.07] bg-[#111018]"
                />
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
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

          {/* EMPTY */}
          {!loading && !error && newDrops.length === 0 && (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold">No new drops right now</p>
              <p className="mt-2 text-sm text-zinc-500">
                Check back soon, or browse everything in the shop.
              </p>
            </div>
          )}

          {/* PRODUCT GRID */}
          {!loading && !error && newDrops.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">

              {newDrops.map((product, index) => {
                const liked = wishlist.includes(product.id);
                const inCart = cartQty(product.id);
                const soldOut = product.stock === 0;
                const maxedOut = product.stock > 0 && inCart >= product.stock;
                const disabled = soldOut || maxedOut;

                return (
                  <article
                    key={product.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111018] transition duration-300 hover:-translate-y-1 hover:border-violet-500/30"
                  >

                    {/* IMAGE */}
                    <div className="relative aspect-[4/5] overflow-hidden">

                      <img
                        src={product.image || PLACEHOLDER}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER;
                        }}
                        className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
                          soldOut ? "opacity-50 grayscale" : ""
                        }`}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* BADGE */}
                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white ${
                          soldOut ? "bg-red-500" : "bg-violet-500"
                        }`}
                      >
                        {badgeFor(product, index)}
                      </span>

                      {/* WISHLIST */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition ${
                          liked
                            ? "border-violet-500 bg-violet-500 text-white"
                            : "border-white/10 bg-black/40 text-white hover:bg-violet-500"
                        }`}
                      >
                        <Heart size={16} fill={liked ? "currentColor" : "none"} />
                      </button>

                      {/* QUICK ACTION: always visible on phones, on hover on desktop */}
                      <div className="absolute bottom-3 left-3 right-3 transition duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => addItem(product)}
                          className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${
                            disabled
                              ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                              : "bg-white text-black hover:bg-violet-500 hover:text-white"
                          }`}
                        >
                          <ShoppingBag size={15} />
                          {soldOut
                            ? "Sold out"
                            : maxedOut
                            ? "Max in cart"
                            : inCart > 0
                            ? `Add more (${inCart} in cart)`
                            : "Add to Cart"}
                        </button>
                      </div>

                    </div>

                    {/* PRODUCT INFO */}
                    <div className="p-4 sm:p-5">

                      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
                        {product.category}
                      </p>

                      <h3 className="line-clamp-2 min-h-[40px] text-sm font-bold text-white sm:text-base">
                        {product.name}
                      </h3>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm font-bold">{money(product.price)}</span>

                        {product.original_price && (
                          <span className="text-xs text-zinc-600 line-through">
                            {money(product.original_price)}
                          </span>
                        )}
                      </div>

                    </div>
                  </article>
                );
              })}

            </div>
          )}

          {/* VIEW ALL */}
          <div className="mt-12 flex justify-center">

            <a
              href="/shop"
              onClick={goToShop}
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:border-violet-500 hover:bg-violet-500"
            >
              Explore All Products

              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}