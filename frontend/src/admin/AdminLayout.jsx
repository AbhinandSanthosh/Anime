import { useAuth } from "../context/AuthContext";

const ITEMS = [
  ["/admin", "Orders"],
  ["/admin/products", "Products"],
  ["/admin/sellers", "Sellers"],
];

export default function AdminLayout({ path, onNavigate, children }) {
  const { user, logout } = useAuth();

  const go = (to) => (e) => {
    e.preventDefault();
    onNavigate(to);
  };

  const cls = (to) =>
    `block rounded-lg px-3 py-2 text-sm font-semibold ${
      path === to ? "bg-violet-500 text-white" : "text-zinc-400 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-[#08070d] text-white">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0c14] p-4 sm:flex">
        <p className="mb-6 text-lg font-black text-violet-400">Admin</p>
        <nav className="space-y-1">
          {ITEMS.map(([to, label]) => (
            <a key={to} href={to} onClick={go(to)} className={cls(to)}>{label}</a>
          ))}
        </nav>
        <div className="mt-auto text-xs text-zinc-500">
          {user.name}
          <button onClick={logout} className="mt-1 block hover:text-white">Sign out</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* mobile nav */}
        <nav className="flex gap-2 border-b border-white/[0.06] p-3 sm:hidden">
          {ITEMS.map(([to, label]) => (
            <a key={to} href={to} onClick={go(to)} className={cls(to)}>{label}</a>
          ))}
          <button onClick={logout} className="ml-auto text-xs text-zinc-400">Sign out</button>
        </nav>
        <div className="p-6 sm:p-10">{children}</div>
      </div>
    </div>
  );
}