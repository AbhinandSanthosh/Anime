import { useEffect, useState } from "react";
import api from "../service/api";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const load = () => api.get("/seller/orders").then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const ship = async (order) => {
    const tracking_number = window.prompt("Tracking number?");
    if (!tracking_number) return;
    try {
      await api.post(`/seller/orders/${order.id}/ship`, { tracking_number });
      load();
    } catch (err) {
      const d = err?.response?.data?.detail;
      setError(typeof d === "string" ? d : "Could not mark as shipped.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black">Orders to ship</h1>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <ul className="mt-6 space-y-4">
        {orders.map((o) => {
          const shipped = o.items.every((i) => i.shipped);
          return (
            <li key={o.id} className="rounded-2xl border border-white/[0.06] bg-[#0d1712] p-5">
              <p className="font-bold">Order #{o.id}</p>
              <p className="mt-2 text-sm text-zinc-400">
                {o.customer_name} · {o.phone}<br />
                {o.address}, {o.city}, {o.state} {o.pincode}
              </p>
              <ul className="mt-3 text-sm text-zinc-300">
                {o.items.map((i, idx) => <li key={idx}>{i.name} × {i.quantity}</li>)}
              </ul>
              {shipped ? (
                <p className="mt-3 text-xs text-emerald-400">Shipped · {o.items[0].tracking_number}</p>
              ) : (
                <button onClick={() => ship(o)} className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold">Mark shipped</button>
              )}
            </li>
          );
        })}
        {orders.length === 0 && <p className="text-sm text-zinc-500">Nothing to ship right now.</p>}
      </ul>
    </div>
  );
}