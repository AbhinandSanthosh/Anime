import { ArrowRight, Play } from "lucide-react";
import moonImage from "../assets/moon-anime.png";
import useProducts from "../hooks/useProducts";
import NavLink from "./NavLink";

const Hero = ({ onNavigate }) => {
  const { products, loading } = useProducts();

  const stats = [
    [loading ? "–" : String(products.length), "Products"],
    ["50K+", "Happy Fans"], // placeholder number: replace with a true figure
    ["100%", "Authentic"],
  ];

  return (
    <section
      id="home"
      className="relative isolate min-h-[620px] overflow-hidden border-b border-white/[0.04] sm:min-h-[680px]"
    >
      {/* BACKGROUND IMAGE */}
      <img
        src={moonImage}
        alt="Anime moon background"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Dark on the text side, clear on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030814]/85 via-[#030814]/55 to-transparent" />

      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] via-[#04060f]/30 to-transparent" />

      {/* Moon glow */}
      <div className="absolute left-[48%] top-[28%] h-96 w-96 rounded-full bg-blue-400/10 blur-[120px]" />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1440px] items-center px-5 py-16 sm:min-h-[680px] sm:px-8 lg:px-10">
        <div className="max-w-[700px]">

          {/* LABEL */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3.5 py-2 backdrop-blur-md sm:mb-6 sm:px-4">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(167,139,250,.9)]" />
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-violet-200">
              The ultimate anime store
            </span>
          </div>

          {/* TITLE */}
          <h1 className="text-[clamp(3.3rem,8vw,7rem)] font-black leading-[.86] tracking-[-.065em] text-white [text-shadow:0_4px_28px_rgba(0,0,0,0.5)]">
            ENTER THE
            <span className="block bg-gradient-to-r from-violet-300 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              ANIME
            </span>
            UNIVERSE
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-6 max-w-[560px] text-sm font-medium leading-6 text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.85)] sm:mt-7 sm:text-base sm:leading-7">
            Discover premium anime merchandise made for true fans.
            From iconic figures to exclusive streetwear, bring your
            favorite worlds into your everyday life.
          </p>

          {/* BUTTONS */}
          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9">
            <NavLink
              href="/shop"
              onNavigate={onNavigate}
              className="group inline-flex items-center gap-3 rounded-full bg-violet-600 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-violet-500 hover:shadow-[0_0_30px_rgba(139,92,246,.35)] sm:px-7 sm:py-4"
            >
              Shop now
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </NavLink>

            <NavLink
              href="/collections"
              onNavigate={onNavigate}
              className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/35 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wide text-white backdrop-blur-md transition hover:border-white/40 hover:bg-black/50 sm:px-7 sm:py-4"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                <Play size={9} fill="currentColor" />
              </span>
              Explore
            </NavLink>
          </div>

          {/* STATS: on a dark glass panel so they stay readable over the clouds */}
          <div className="mt-9 inline-flex items-center gap-5 rounded-2xl border border-white/10 bg-black/45 px-5 py-4 backdrop-blur-md sm:mt-12 sm:gap-9 sm:px-7">
            {stats.map(([value, label], index) => (
              <div key={label} className="flex items-center gap-5 sm:gap-9">
                {index > 0 && <span className="h-8 w-px bg-white/20" />}
                <div>
                  <p className="text-xl font-black sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[11px] font-medium text-zinc-200 sm:text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-7 right-8 hidden items-center gap-3 xl:flex">
        <span className="text-[9px] font-semibold uppercase tracking-[3px] text-zinc-300">
          Scroll to explore
        </span>
        <div className="h-9 w-5 rounded-full border border-white/30 p-1">
          <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-white/80" />
        </div>
      </div>
    </section>
  );
};

export default Hero;