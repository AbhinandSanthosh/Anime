import { useAuth } from "../context/AuthContext";

const ITEMS = [
  ["/seller", "My products"],
  ["/seller/orders", "Orders to ship"],
];

export default function SellerLayout({ path, onNavigate, children }) {
  const { user, logout } = useAuth();

  const go = (to) => (e) => {
    e.preventDefault();
    onNavigate(to);
  };

  return (
    <div className="min-h-screen bg-[#07100d] text-white">
      <header className="border-b border-white/[0.06] px-4 pt-4 sm:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="text-lg font-black text-emerald-400">Seller Hub</p>
          <button onClick={logout} className="text-xs text-zinc-400 hover:text-white">
            {user.name} · Sign out
          </button>
        </div>
        <nav className="mx-auto mt-4 flex max-w-5xl gap-6">
          {ITEMS.map(([to, label]) => (
            <a
              key={to}
              href={to}
              onClick={go(to)}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold ${
                path === to
                  ? "border-emerald-400 text-white"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-10">{children}</div>
    </div>
  );
}