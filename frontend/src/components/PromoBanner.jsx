import { ArrowRight } from "lucide-react";

const PromoBanner = () => (
  <section className="bg-[#08070d] pb-16 sm:pb-24">
    <div className="section-shell">
      <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-white/[0.06] sm:min-h-[420px]">
        <img src="https://images.unsplash.com/photo-1577083288073-40892c0860a4?auto=format&fit=crop&w=1800&q=88" alt="Anime collection" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08070d] via-[#08070d]/85 to-transparent" />
        <div className="absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="relative z-10 flex min-h-[360px] items-center p-6 sm:min-h-[420px] sm:p-12 lg:p-14">
          <div className="max-w-[560px]"><p className="mb-4 text-[10px] font-extrabold uppercase tracking-[3px] text-violet-400">Limited collection</p><h2 className="text-4xl font-black leading-[.95] tracking-[-.05em] sm:text-5xl">LEVEL UP <span className="block text-violet-400">YOUR COLLECTION</span></h2><p className="mt-5 max-w-[500px] text-xs leading-6 text-zinc-400 sm:text-sm sm:leading-7">Discover exclusive anime merchandise designed for collectors, fans, and everyone who lives in the anime world.</p><a href="#collections" className="group mt-7 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-[10px] font-black uppercase tracking-wide text-black transition hover:bg-violet-500 hover:text-white sm:px-7 sm:py-4">Explore collection <ArrowRight size={15} className="transition group-hover:translate-x-1" /></a></div>
        </div>
        <div className="absolute bottom-[-24px] right-8 hidden select-none text-[130px] font-black tracking-[-8px] text-white/[0.025] lg:block">ANIME</div>
      </div>
    </div>
  </section>
);

export default PromoBanner;
