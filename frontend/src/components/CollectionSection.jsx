import { ArrowRight } from "lucide-react";

const collections = [
  { title: "SHONEN LEGENDS", description: "Power. Rivalry. Adventure.", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=88" },
  { title: "DARK UNIVERSE", description: "For fans of the darker side.", image: "https://images.unsplash.com/photo-1577083288073-40892c0860a4?auto=format&fit=crop&w=1200&q=88" },
  { title: "OTAKU STREET", description: "Anime meets streetwear.", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=88" },
];

const CollectionSection = () => (
  <section id="collections" className="bg-[#08070d] pb-16 sm:pb-24">
    <div className="section-shell">
      <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
        <div><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[3px] text-violet-400">Discover</p><h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">Anime Collections</h2><p className="mt-2 text-xs text-zinc-500 sm:text-sm">Explore collections created for every kind of anime fan.</p></div>
        <a href="#newsletter" className="group hidden items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white sm:flex">View collections <ArrowRight size={15} className="transition group-hover:translate-x-1" /></a>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-5">
        {collections.map((collection, index) => (
          <a key={collection.title} href="#newsletter" className="group relative aspect-[.9] overflow-hidden rounded-2xl bg-[#111018] sm:aspect-[.78]">
            <img src={collection.image} alt={collection.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
            <span className="absolute right-5 top-5 text-[9px] font-bold tracking-[2px] text-white/45">0{index + 1}</span>
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7"><p className="text-[9px] font-semibold uppercase tracking-[2px] text-violet-300">{collection.description}</p><h3 className="mt-2 text-xl font-black tracking-wide sm:text-2xl">{collection.title}</h3><span className="mt-4 flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[1.5px]">Explore collection <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span></div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default CollectionSection;
