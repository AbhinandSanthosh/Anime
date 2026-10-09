import { useMemo, useState } from "react";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";

import useProducts from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import NavLink from "./NavLink";

const PLACEHOLDER = "/products/placeholder.png";
const money = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

const ProductSection = ({ onNavigate }) => {
  const { products, loading, error } = useProducts();
  const { addItem, items } = useCart();
  const [wishlist, setWishlist] = useState([]);

  // Featured products first (newest first), then the newest of the rest
  const trending = useMemo(() => {
    const newestFirst = [...products].sort((a, b) => b.id - a.id);
    return [
      ...newestFirst.filter((p) => p.is_featured),
      ...newestFirst.filter((p) => !p.is_featured),
    ].slice(0, 4);
  }, [products]);

  const cartQty = (id) => items.find((i) => i.id === id)?.quantity || 0;

  const toggleWishlist = (id) =>
    setWishlist((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );

  const badgeFor = (p) => {
    if (p.stock === 0) return { text: "Sold out", cls: "bg-red-500" };
    if (p.is_featured) return { text: "Trending", cls: "bg-violet-500" };
    if (p.is_new) return { text: "New", cls: "bg-violet-500" };
    return null;
  };

  return (
    <section id="trending" className="bg-[#08070d] pb-16 sm:pb-24">
      <div className="section-shell">
        <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[3px] text-violet-400">Fan favorites</p>
            <h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">Trending Now</h2>
            <p className="mt-2 text-xs text-zinc-500 sm:text-sm">The merchandise everyone is talking about.</p>
          </div>
          <NavLink
            href="/shop"
            onNavigate={onNavigate}
            className="group hidden items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white sm:flex"
          >
            View all <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </NavLink>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-5 lg:grid-cols-4">
          {loading &&
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-[#111018]" />
            ))}

          {!loading &&
            trending.map((product) => {
              const liked = wishlist.includes(product.id);
              const inCart = cartQty(product.id);
              const soldOut = product.stock === 0;
              const maxedOut = product.stock > 0 && inCart >= product.stock;
              const disabled = soldOut || maxedOut;
              const badge = badgeFor(product);

              return (
                <article key={product.id} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#111018]">
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

                    {badge && (
                      <span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white ${badge.cls}`}>
                        {badge.text}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                      className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition ${
                        liked ? "bg-violet-500 text-white" : "bg-black/40 text-white hover:bg-violet-500"
                      }`}
                    >
                      <Heart size={16} fill={liked ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="px-1 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-violet-400">
                      {product.category}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold">{product.name}</h3>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-sm font-black">{money(product.price)}</span>
                      {product.original_price && (
                        <span className="text-xs text-zinc-600 line-through">{money(product.original_price)}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => addItem(product)}
                      className={`mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full text-xs font-bold transition ${
                        disabled
                          ? "cursor-not-allowed bg-zinc-800 text-zinc-600"
                          : "bg-white text-black hover:bg-violet-500 hover:text-white"
                      }`}
                    >
                      <ShoppingBag size={14} />
                      {soldOut ? "Sold out" : maxedOut ? "Max in cart" : inCart > 0 ? `Add more (${inCart})` : "Add to cart"}
                    </button>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;