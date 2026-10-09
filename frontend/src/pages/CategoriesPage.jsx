import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Shirt,
  Backpack,
  Image,
  Sparkles,
  Tag,
} from "lucide-react";

import Footer from "../components/Footer";
import categoriesHero from "../assets/categories.png";
import api from "../service/api";

const PLACEHOLDER = "/products/placeholder.png";

// Known categories: shown first and in this order, even before they have products.
// Any other category found in the database is added after them automatically.
const KNOWN = ["Apparel", "Figures", "Accessories", "Wall Art"];

const META = {
  apparel: {
    description: "Oversized tees, hoodies and anime-inspired streetwear.",
    icon: Shirt,
  },
  figures: {
    description: "Collect your favorite anime characters and legends.",
    icon: Sparkles,
  },
  accessories: {
    description: "Complete your anime look with premium accessories.",
    icon: Backpack,
  },
  "wall art": {
    description: "Bring your favorite anime worlds into your space.",
    icon: Image,
  },
};

const DEFAULT_META = {
  description: "Browse everything in this category.",
  icon: Tag,
};

const money = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function CategoriesPage({ onNavigate }) {
  const [products, setProducts] = useState([]);
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
            category: (p.category || "Other").trim(),
            price: Number(p.price) || 0,
            image: p.image || null,
            is_featured: Boolean(p.is_featured),
            stock: Number(p.stock) || 0,
          }))
        );
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Unable to load categories.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Build one entry per category from the real products
  const groups = useMemo(() => {
    const map = new Map();

    KNOWN.forEach((name) => map.set(name.toLowerCase(), { name, items: [] }));

    products.forEach((p) => {
      const key = p.category.toLowerCase();
      if (!map.has(key)) map.set(key, { name: p.category, items: [] });
      map.get(key).items.push(p);
    });

    const known = KNOWN.map((n) => map.get(n.toLowerCase()));
    const extra = [...map.values()]
      .filter((g) => !KNOWN.some((n) => n.toLowerCase() === g.name.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...known, ...extra].map((g) => {
      const withImage = g.items.filter((p) => p.image);
      // Cover photo: a featured product if there is one, otherwise the newest
      const cover =
        withImage.find((p) => p.is_featured) ||
        [...withImage].sort((a, b) => b.id - a.id)[0] ||
        null;

      return {
        name: g.name,
        count: g.items.length,
        minPrice: g.items.length ? Math.min(...g.items.map((p) => p.price)) : null,
        cover: cover?.image || null,
        ...(META[g.name.toLowerCase()] || DEFAULT_META),
      };
    });
  }, [products]);

  const goToShop = (event, name) => {
    event.preventDefault();
    const href = name
      ? `/shop?category=${encodeURIComponent(name)}`
      : "/shop";

    if (onNavigate) onNavigate(href);
    else window.location.assign(href);
  };

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <>
      <main className="min-h-screen bg-[#08070d] text-white">

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-white/[0.06]">

          <img
            src={categoriesHero}
            alt="Anime categories"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark only on the text side, so the character on the right stays bright */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08070d] via-[#08070d]/80 to-transparent sm:via-[#08070d]/70 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08070d] via-transparent to-transparent" />

          <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-violet-300">
              EXPLORE ANIMORA
            </p>

            <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-white [text-shadow:0_4px_28px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-8xl">
              SHOP BY
              <span className="block text-violet-400">
                CATEGORY.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm font-medium leading-7 text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.9)] sm:text-base">
              Discover carefully selected anime merchandise
              made for collectors, fans and everyday
              streetwear lovers.
            </p>
          </div>
        </section>

        {/* CATEGORY GRID */}
        <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-10 lg:py-20">

          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400">
                FIND YOUR WORLD
              </p>

              <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">
                Explore Categories
              </h2>
            </div>

            {!loading && !error && (
              <span className="hidden text-sm text-zinc-500 sm:block">
                {pad(groups.length)} Categories · {products.length} Products
              </span>
            )}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
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

          {/* CATEGORIES */}
          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {groups.map((group, index) => {
                const Icon = group.icon;
                const empty = group.count === 0;

                return (
                  <a
                    key={group.name}
                    href={`/shop?category=${encodeURIComponent(group.name)}`}
                    onClick={(e) => goToShop(e, group.name)}
                    className="group relative block overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111018] transition hover:border-violet-500/40"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">

                      <img
                        src={group.cover || PLACEHOLDER}
                        alt={group.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER;
                        }}
                        className={`h-full w-full object-cover transition duration-700 group-hover:scale-110 ${
                          empty ? "opacity-40 grayscale" : ""
                        }`}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

                      <span className="absolute right-5 top-5 text-xs font-bold tracking-widest text-white/70">
                        {pad(index + 1)}
                      </span>

                      <div className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
                        <Icon size={17} className="text-white" strokeWidth={1.7} />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">

                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300">
                          {empty
                            ? "Coming soon"
                            : `${group.count} ${group.count === 1 ? "product" : "products"}`}
                        </p>

                        <h3 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
                          {group.name}
                        </h3>

                        <p className="mt-2 max-w-xs text-xs leading-5 text-zinc-200">
                          {group.description}
                        </p>

                        {group.minPrice !== null && (
                          <p className="mt-2 text-xs font-semibold text-white">
                            From {money(group.minPrice)}
                          </p>
                        )}

                        <span className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white transition group-hover:text-violet-300">
                          Shop Now
                          <ArrowRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </span>

                      </div>
                    </div>
                  </a>
                );
              })}

            </div>
          )}
        </section>

        {/* BOTTOM CTA */}
        <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-10 lg:pb-24">

          <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#111018] px-6 py-12 text-center sm:px-10 lg:py-20">

            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[100px]" />

            <div className="relative">

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400">
                YOUR ANIME. YOUR STYLE.
              </p>

              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Find something that
                <span className="text-violet-500">
                  {" "}feels like you.
                </span>
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-400">
                From everyday streetwear to collectible
                figures, there's always something new
                waiting inside ANIMORA.
              </p>

              <a
                href="/shop"
                onClick={(e) => goToShop(e, "")}
                className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-violet-400"
              >
                Browse all products
                <ArrowRight size={15} />
              </a>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}