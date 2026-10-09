import { ArrowRight, Mail } from "lucide-react";

const Newsletter = () => (
  <section id="newsletter" className="bg-[#08070d] pb-16 sm:pb-24">
    <div className="section-shell">
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/15 bg-[#12101a]">
        <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[110px]" />
        <div className="relative z-10 grid gap-8 px-5 py-8 sm:px-10 sm:py-12 lg:grid-cols-[1fr_480px] lg:items-center lg:px-14 lg:py-14">
          <div><div className="mb-4 flex items-center gap-2 text-violet-400"><Mail size={16} /><span className="text-[10px] font-extrabold uppercase tracking-[3px]">Join the club</span></div><h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">Stay in the <span className="text-violet-400">Anime Loop.</span></h2><p className="mt-3 max-w-[500px] text-xs leading-6 text-zinc-500 sm:text-sm sm:leading-7">Get first access to new drops, exclusive collections, special offers, and everything happening at ANIMORA.</p></div>
          <form className="w-full" onSubmit={(e) => e.preventDefault()}><div className="flex rounded-full border border-white/10 bg-black/30 p-1.5 backdrop-blur-md"><input type="email" required placeholder="Enter your email address" className="min-w-0 flex-1 bg-transparent px-4 text-xs text-white outline-none placeholder:text-zinc-600 sm:px-5 sm:text-sm" /><button className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-violet-600 px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide sm:px-6 sm:py-3.5 sm:text-[10px]">Subscribe <ArrowRight size={14} className="transition group-hover:translate-x-1" /></button></div><p className="mt-2 pl-4 text-[9px] text-zinc-600">No spam. Only anime drops, offers, and updates.</p></form>
        </div>
      </div>
    </div>
  </section>
);

export default Newsletter;
