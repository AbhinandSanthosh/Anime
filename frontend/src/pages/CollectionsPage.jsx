import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles, Crown, Moon } from "lucide-react";

import Footer from "../components/Footer";
import darkUniverseImage from "../assets/dark-universe.png";
import api from "../service/api";

const PLACEHOLDER = "/products/placeholder.png";
const money = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

// The look of each collection. Products join a collection from the admin Products page.
const COLLECTIONS = [
  {
    title: "Shonen Legends",
    subtitle: "POWER • RIVALRY • ADVENTURE",
    description:
      "Explore legendary anime worlds filled with powerful heroes, unforgettable rivals and epic adventures.",
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Dark Universe",
    subtitle: "FOR FANS OF THE DARKER SIDE",
    description:
      "Step into mysterious worlds, darker stories and characters that live beyond the ordinary.",
    image: darkUniverseImage,
  },
  {
    title: "Otaku Street",
    subtitle: "ANIME MEETS STREETWEAR",
    description:
      "Where anime culture meets modern streetwear. Build your everyday look around the worlds you love.",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Limited Edition",
    subtitle: "RARE • EXCLUSIVE • COLLECTIBLE",
    description:
      "Discover limited pieces created for collectors who want something truly special.",
    image:
      "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1400&q=85",
  },
];

export default function CollectionsPage({ onNavigate }) {
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
            collection: (p.collection || "").trim(),
            price: Number(p.price) || 0,
            image: p.image || null,
          }))
        );
      } catch (err) {
        console.error("Failed to load collections:", err);
        setError("Unable to load collection details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const groups = useMemo(
    () =>
      COLLECTIONS.map((c) => {
        const items = products.filter(
          (p) => p.collection.toLowerCase() === c.title.toLowerCase()
        );
        return {
          ...c,
          count: items.length,
          minPrice: items.length ? Math.min(...items.map((p) => p.price)) : null,
          preview: [...items].sort((a, b) => b.id - a.id).slice(0, 3),
        };
      }),
    [products]
  );

  const go = (event, href) => {
    event.preventDefault();
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
            src={darkUniverseImage}
            alt="Dark Universe"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Dark only on the text side, so the character in the middle stays visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08070d] via-[#08070d]/80 to-transparent sm:via-[#08070d]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08070d] via-transparent to-transparent" />

          <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">

            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-violet-300">
              EXPLORE ANIMORA
            </p>

            <h1 className="max-w-6xl text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white [text-shadow:0_4px_28px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-8xl">
              YOUR
              <span className="block text-violet-400">UNIVERSE.</span>
            </h1>

            <p className="mt-6 max-w-lg text-sm font-medium leading-7 text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.9)] sm:text-base">
              Explore curated anime collections designed
              around different worlds, styles and fandoms.
              Find the universe that feels like yours.
            </p>

          </div>
        </section>

        {/* COLLECTIONS */}
        <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-10 lg:py-20">

          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400">
                CURATED WORLDS
              </p>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Anime Collections
              </h2>
            </div>

            <span className="hidden text-sm text-zinc-500 sm:block">
              {pad(groups.length)} Collections
            </span>
          </div>

          {error && <p className="mb-6 text-sm text-red-400">{error}</p>}

          <div className="grid gap-5 lg:grid-cols-2">

            {groups.map((c, index) => {
              const empty = c.count === 0;
              const href = empty
                ? "/shop"
                : `/shop?collection=${encodeURIComponent(c.title)}`;

              return (
                <a
                  key={c.title}
                  href={href}
                  onClick={(e) => go(e, href)}
                  className="group relative block min-h-[420px] overflow-hidden rounded-3xl border border-white/[0.07] bg-[#111018] transition hover:border-violet-500/40 sm:min-h-[500px]"
                >
                  <img
                    src={c.image}
                    alt={c.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-80" />

                  <span className="absolute right-6 top-6 text-xs font-bold tracking-[0.25em] text-white/70">
                    {pad(index + 1)}
                  </span>

                  {/* Real products from this collection */}
                  {c.preview.length > 0 && (
                    <div className="absolute left-6 top-6 flex -space-x-3 sm:left-8 sm:top-8">
                      {c.preview.map((p) => (
                        <img
                          key={p.id}
                          src={p.image || PLACEHOLDER}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PLACEHOLDER;
                          }}
                          className="h-12 w-12 rounded-full border-2 border-[#08070d] bg-zinc-900 object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">

                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300">
                      {c.subtitle}
                    </p>

                    <h3 className="max-w-xl text-3xl font-black uppercase tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
                      {c.title}
                    </h3>

                    <p className="mt-3 max-w-lg text-xs leading-6 text-zinc-200 sm:text-sm">
                      {c.description}
                    </p>

                    <p className="mt-3 text-xs font-semibold text-white">
                      {loading
                        ? "Loading..."
                        : empty
                        ? "Coming soon"
                        : `${c.count} ${c.count === 1 ? "product" : "products"} · from ${money(c.minPrice)}`}
                    </p>

                    <span className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white transition group-hover:text-violet-300">
                      {empty ? "Browse the shop" : "Explore Collection"}
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>

                  </div>
                </a>
              );
            })}

          </div>
        </section>

        {/* FEATURED COLLECTION CTA */}
        <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-10 lg:pb-24">

          <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#111018] px-6 py-14 text-center sm:px-10 lg:py-20">

            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[110px]" />

            <div className="relative">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10">
                <Crown size={20} className="text-violet-400" />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400">
                THE ANIMORA ARCHIVE
              </p>

              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Every fandom has a
                <span className="text-violet-500"> world.</span>
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-400">
                Explore our growing collection of anime
                inspired apparel, figures, accessories and
                exclusive pieces.
              </p>

              <a
                href="/shop"
                onClick={(e) => go(e, "/shop")}
                className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-violet-400"
              >
                Explore The Archive
                <ArrowRight size={15} />
              </a>

            </div>
          </div>
        </section>

        {/* SMALL FEATURE ROW */}
        <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-10">

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-white/[0.07] bg-[#111018] p-6">
              <Moon size={20} className="mb-4 text-violet-400" />
              <h3 className="text-lg font-bold">Dark & Mysterious</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Discover collections inspired by darker
                anime universes and unforgettable characters.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-[#111018] p-6">
              <Sparkles size={20} className="mb-4 text-violet-400" />
              <h3 className="text-lg font-bold">Always Something New</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                New collections and exclusive drops are
                continuously added to ANIMORA.
              </p>
            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}