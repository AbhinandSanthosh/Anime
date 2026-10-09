import { useEffect, useState } from "react";
import api from "../service/api";

const input = "h-11 rounded-xl border border-white/[0.08] bg-[#111018] px-4 text-sm outline-none focus:border-violet-500/60";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const load = () => api.get("/admin/sellers").then((r) => setSellers(r.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/sellers", form);
      setForm({ name: "", email: "", password: "" });
      setError("");
      load();
    } catch (err) {
      const d = err?.response?.data?.detail;
      setError(typeof d === "string" ? d : "Could not create seller.");
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-black">Sellers</h1>

      <form onSubmit={create} className="mt-6 grid gap-3 sm:grid-cols-4">
        <input className={input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={input} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className={input} type="password" placeholder="Password (8+)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="h-11 rounded-xl bg-violet-500 text-sm font-bold">Add seller</button>
      </form>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <ul className="mt-8 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-[#111018]">
        {sellers.map((s) => (
          <li key={s.id} className="flex justify-between px-5 py-4 text-sm">
            <span className="font-semibold">{s.name}</span>
            <span className="text-zinc-400">{s.email}</span>
          </li>
        ))}
        {sellers.length === 0 && <li className="px-5 py-4 text-sm text-zinc-500">No sellers yet.</li>}
      </ul>
    </div>
  );
}