import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const THEMES = {
  admin: { accent: "bg-violet-500 hover:bg-violet-400", ring: "focus:border-violet-500/60", label: "Admin Console" },
  seller: { accent: "bg-emerald-500 hover:bg-emerald-400", ring: "focus:border-emerald-500/60", label: "Seller Hub" },
};

export default function PortalGate({ role, children }) {
  const { user, loading, login, logout } = useAuth();
  const t = THEMES[role];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (loading) return <main className="min-h-screen bg-[#08070d]" />;

  if (user && user.role !== role) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#08070d] text-white">
        <p>This is the {role} portal. You are signed in as a {user.role}.</p>
        <button onClick={logout} className="text-xs text-zinc-400 hover:text-white">Sign out</button>
      </main>
    );
  }

  if (user) return children;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed.");
    }
  };

  const input = `h-12 w-full rounded-xl border border-white/[0.08] bg-[#111018] px-4 text-sm text-white outline-none ${t.ring}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08070d] px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/[0.06] bg-[#111018] p-8">
        <h1 className="text-xl font-black">{t.label}</h1>
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button className={`h-12 w-full rounded-xl text-sm font-bold text-white ${t.accent}`}>Sign in</button>
      </form>
    </main>
  );
}