import { CreditCard, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "100% AUTHENTIC", description: "Every product is carefully selected to bring you genuine anime merchandise." },
  { icon: Truck, title: "FAST SHIPPING", description: "Get your favorite anime products delivered quickly and safely to your doorstep." },
  { icon: CreditCard, title: "SECURE PAYMENTS", description: "Shop confidently with secure and trusted payment options." },
  { icon: RotateCcw, title: "EASY RETURNS", description: "Changed your mind? Enjoy a simple and hassle-free return experience." },
];

const WhyChooseUs = () => (
  <section className="bg-[#08070d] pb-16 sm:pb-24">
    <div className="section-shell">
      <div className="mb-9 text-center sm:mb-12"><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[3px] text-violet-400">The ANIMORA difference</p><h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">Why Choose ANIMORA?</h2><p className="mx-auto mt-2 max-w-[520px] text-xs leading-6 text-zinc-500 sm:text-sm">Everything you need for a better anime shopping experience.</p></div>
      <div className="grid overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101016] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/[0.07]">
        {features.map(({ icon: Icon, title, description }) => <div key={title} className="group border-b border-white/[0.07] px-5 py-8 text-center transition hover:bg-white/[0.02] sm:px-7 lg:border-b-0 lg:py-10"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#17171f] text-violet-400 transition group-hover:border-violet-500/40 group-hover:bg-violet-500/10"><Icon size={21} strokeWidth={1.7} /></div><h3 className="mt-5 text-[10px] font-black tracking-[1.5px]">{title}</h3><p className="mx-auto mt-2 max-w-[240px] text-[11px] leading-5 text-zinc-500">{description}</p></div>)}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
