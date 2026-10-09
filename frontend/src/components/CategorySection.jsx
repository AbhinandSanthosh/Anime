import { useMemo } from "react";
import { ArrowRight } from "lucide-react";

import useProducts from "../hooks/Useproducts";
import NavLink from "./NavLink";

const PLACEHOLDER = "/products/placeholder.png";

const KNOWN = [
  { name: "Apparel", subtitle: "Wear your world" },
  { name: "Figures", subtitle: "Collect your favorites" },
  { name: "Accessories", subtitle: "Complete your look" },
  { name: "Wall Art", subtitle: "Bring anime home" },
];

const CategorySection = ({ onNavigate }) => {
  const { products, loading } = useProducts();

  const categories = useMemo(() => {
    const map = new Map(
      KNOWN.map((k) => [k.name.toLowerCase(), { ...k, items: [] }])
    );

    products.forEach((p) => {
      const key = p.category.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { name: p.category, subtitle: "Browse the range", items: [] });
      }
      map.get(key).items.push(p);
    });

    return [...map.values()].map((c) => {
      const withImage = c.items.filter((p) => p.image);
      // Cover photo: a featured product if there is one, otherwise the newest
      const cover =
        withImage.find((p) => p.is_featured) ||
        [...withImage].sort((a, b) => b.id - a.id)[0];

      return { ...c, count: c.items.length, cover: cover?.image || null };
    });
  }, [products]);

  return (
    <section id="categories" className="bg-[#08070d] py-16 sm:py-24">
      <div className="section-shell">
        <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[3px] text-violet-400">Explore</p>
            <h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">Shop by Category</h2>
            <p className="mt-2 text-xs text-zinc-500 sm:text-sm">Find something that matches your anime obsession.</p>
          </div>
          <NavLink
            href="/categories"
            onNavigate={onNavigate}
            className="group hidden items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white sm:flex"
          >
            View all <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </NavLink>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {loading &&
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[.82] animate-pulse rounded-2xl bg-[#111018] sm:aspect-[.8]" />
            ))}

          {!loading &&
            categories.map((category) => {
              const href = `/shop?category=${encodeURIComponent(category.name)}`;

              return (
                <NavLink
                  key={category.name}
                  href={href}
                  onNavigate={onNavigate}
                  className="group relative aspect-[.82] overflow-hidden rounded-2xl bg-[#111018] sm:aspect-[.8]"
                >
                  <img
                    src={category.cover || PLACEHOLDER}
                    alt={category.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PLACEHOLDER;
                    }}
                    className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
                      category.count === 0 ? "opacity-40 grayscale" : ""
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                  <div className="absolute inset-0 bg-violet-600/0 transition group-hover:bg-violet-500/[0.08]" />

                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[1.8px] text-zinc-200">
                      {category.subtitle}
                    </p>
                    <h3 className="mt-1 text-lg font-black uppercase tracking-wide text-white sm:text-2xl">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-300">
                      {category.count === 0
                        ? "Coming soon"
                        : `${category.count} ${category.count === 1 ? "item" : "items"}`}
                    </p>
                    <span className="mt-3 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[1.5px] text-white opacity-0 transition group-hover:opacity-100 sm:flex">
                      Explore <ArrowRight size={13} />
                    </span>
                  </div>
                </NavLink>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;