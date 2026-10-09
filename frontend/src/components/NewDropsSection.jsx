import { useMemo, useState } from "react";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";

import useProducts from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import NavLink from "./NavLink";
const PLACEHOLDER = "/products/placeholder.png";
const money = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

const onImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = PLACEHOLDER;
};

const NewDropsSection = ({ onNavigate }) => {
  const { products, loading } = useProducts();
  const { addItem, items } = useCart();
  const [wishlist, setWishlist] = useState([]);

  // Products marked "New arrival", newest first
  const drops = useMemo(
    () => products.filter((p) => p.is_new).sort((a, b) => b.id - a.id).slice(0, 4),
    [products]
  );

  const cartQty = (id) => items.find((i) => i.id === id)?.quantity || 0;
  const toggleWishlist = (id) =>
    setWishlist((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  // Nothing marked new: hide the whole section instead of showing an empty one
  if (!loading && drops.length === 0) return null;

  const [main, ...rest] = drops;

  const stateFor = (p) => {
    const inCart = cartQty(p.id);
    const soldOut = p.stock === 0;
    const maxedOut = p.stock > 0 && inCart >= p.stock;
    return { inCart, soldOut, maxedOut, disabled: soldOut || maxedOut };
  };

  return (
    <section id="new-drops" className="bg-[#08070d] pb-16 sm:pb-24">
      <div className="section-shell">
        <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[3px] text-violet-400">Just arrived</p>
            <h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">New Drops</h2>
            <p className="mt-2 text-xs text-zinc-500 sm:text-sm">Fresh releases for your anime collection.</p>
          </div>
          <NavLink
            href="/new-drops"
            onNavigate={onNavigate}
            className="group hidden items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white sm:flex"
          >
            Explore all <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </NavLink>
        </div>

        {loading && (
          <div className="grid gap-3 sm:gap-5 lg:grid-cols-[1.12fr_.88fr]">
            <div className="min-h-[520px] animate-pulse rounded-2xl bg-[#111018] sm:min-h-[620px]" />
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="min-h-[255px] animate-pulse rounded-2xl bg-[#111018] sm:min-h-[300px]" />
              ))}
            </div>
          </div>
        )}

        {!loading && main && (
          <div className={`grid gap-3 sm:gap-5 ${rest.length > 0 ? "lg:grid-cols-[1.12fr_.88fr]" : ""}`}>
            {/* MAIN CARD */}
            {(() => {
              const s = stateFor(main);
              return (
                <article className="group relative min-h-[520px] overflow-hidden rounded-2xl bg-[#111018] sm:min-h-[620px]">
                  <img
                    src={main.image || PLACEHOLDER}
                    alt={main.name}
                    onError={onImgError}
                    className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${s.soldOut ? "opacity-50 grayscale" : ""}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[1.5px] text-black sm:left-6 sm:top-6">
                    {s.soldOut ? "Sold out" : "New arrival"}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(main.id)}
                    aria-label="Wishlist"
                    className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md sm:right-6 sm:top-6 ${wishlist.includes(main.id) ? "bg-violet-500" : "bg-black/40"}`}
                  >
                    <Heart size={17} fill={wishlist.includes(main.id) ? "currentColor" : "none"} />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                    <p className="text-[10px] font-bold uppercase tracking-[2px] text-violet-300">{main.category}</p>
                    <h3 className="mt-2 max-w-[480px] text-2xl font-black tracking-[-.03em] text-white sm:text-3xl">{main.name}</h3>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <span className="text-lg font-bold">{money(main.price)}</span>
                      <button
                        type="button"
                        disabled={s.disabled}
                        onClick={() => addItem(main)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-[10px] font-extrabold transition sm:px-5 ${
                          s.disabled ? "cursor-not-allowed bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-violet-500 hover:text-white"
                        }`}
                      >
                        <ShoppingBag size={14} />
                        {s.soldOut ? "SOLD OUT" : s.maxedOut ? "MAX IN CART" : "ADD TO CART"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })()}

            {/* SMALL CARDS */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                {rest.map((product) => {
                  const s = stateFor(product);
                  return (
                    <article key={product.id} className="group relative min-h-[255px] overflow-hidden rounded-2xl bg-[#111018] sm:min-h-[300px]">
                      <img
                        src={product.image || PLACEHOLDER}
                        alt={product.name}
                        onError={onImgError}
                        className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${s.soldOut ? "opacity-50 grayscale" : ""}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label="Wishlist"
                        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition sm:opacity-0 sm:group-hover:opacity-100 ${wishlist.includes(product.id) ? "bg-violet-500" : "bg-black/40"}`}
                      >
                        <Heart size={15} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                      </button>

                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-[9px] font-bold uppercase tracking-[1.8px] text-violet-300">{product.category}</p>
                        <h3 className="mt-1 line-clamp-2 text-xs font-bold text-white sm:text-sm">{product.name}</h3>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-bold">{money(product.price)}</span>
                          <button
                            type="button"
                            disabled={s.disabled}
                            onClick={() => addItem(product)}
                            aria-label="Add to cart"
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                              s.disabled ? "cursor-not-allowed bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-violet-500 hover:text-white"
                            }`}
                          >
                            <ShoppingBag size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewDropsSection;