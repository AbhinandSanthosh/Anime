import { ArrowUp } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const columns = [
  { title: "Shop", links: ["All Products", "Apparel", "Figures", "Accessories", "New Drops"] },
  { title: "Collections", links: ["Shonen Legends", "Dark Universe", "Otaku Street", "Limited Edition"] },
  { title: "Support", links: ["Contact Us", "Shipping & Delivery", "Returns & Refunds", "FAQs", "Privacy Policy"] },
];

const Footer = () => (
  <footer className="border-t border-white/[0.07] bg-[#07060b]">
    <div className="section-shell py-14 sm:py-20">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.25fr] lg:gap-8">
        <div><a href="#home" className="text-[25px] font-black tracking-[-1.5px]">ANIM<span className="text-violet-500">ORA</span></a><p className="mt-4 max-w-[300px] text-xs leading-6 text-zinc-500 sm:text-sm sm:leading-7">Your destination for premium anime merchandise, collectibles, streetwear, and everything otaku.</p><div className="mt-6 flex gap-2.5">{[[FaInstagram,"Instagram"],[FaTwitter,"Twitter"],[FaYoutube,"YouTube"],[FaFacebookF,"Facebook"]].map(([Icon,label]) => <a key={label} href="#" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"><Icon size={14} /></a>)}</div></div>
        {columns.map((column) => <div key={column.title}><h3 className="text-[10px] font-extrabold uppercase tracking-[2px]">{column.title}</h3><div className="mt-5 flex flex-col gap-3">{column.links.map((link) => <a key={link} href="#" className="text-xs text-zinc-500 transition hover:text-white">{link}</a>)}</div></div>)}
        <div><h3 className="text-[10px] font-extrabold uppercase tracking-[2px]">Need help?</h3><p className="mt-5 text-xs leading-6 text-zinc-500">Our support team is here to help with your order, products, or anything else.</p><a href="mailto:support@animora.com" className="mt-4 inline-block text-xs font-semibold text-violet-400 hover:text-violet-300">support@animora.com</a><p className="mt-2 text-[10px] text-zinc-600">Mon – Sat · 9:00 AM – 6:00 PM</p></div>
      </div>
    </div>
    <div className="border-t border-white/[0.07]"><div className="section-shell flex flex-col gap-4 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left"><p className="text-[10px] text-zinc-600">© 2026 ANIMORA. All rights reserved.</p><div className="flex items-center justify-center gap-2"><span className="mr-1 text-[9px] uppercase tracking-[1.5px] text-zinc-600">Secure payments</span>{["VISA","UPI","RAZORPAY"].map((x)=><span key={x} className="rounded border border-white/10 px-2 py-1 text-[8px] font-bold text-zinc-500">{x}</span>)}</div><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="group inline-flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[1px] text-zinc-500 hover:text-white">Back to top <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 group-hover:border-violet-500/40"><ArrowUp size={12} /></span></button></div></div>
  </footer>
);

export default Footer;
