import { useCallback, useEffect, useState } from "react";
import api from "../service/api";

const formatPrice = (v) => `₹${Number(v).toLocaleString("en-IN")}`;
const FILTERS = ["", "confirmed", "shipped", "delivered", "needs_review", "pending", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("confirmed");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/orders", { params: filter ? { status: filter } : {} });
      setOrders(data);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not load orders.");
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const update = async (order, status) => {
    let tracking_number = null;
    if (status === "shipped") {
      tracking_number = window.prompt("Tracking number?");
      if (!tracking_number) return;
    }
    try {
      await api.patch(`/admin/orders/${order.id}`, { status, tracking_number });
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Update failed.");
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-black">Orders</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f || "all"}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === f ? "bg-violet-500" : "bg-white/[0.06] text-zinc-400"
            }`}
          >
            {f || "all"}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <ul className="mt-6 space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="rounded-2xl border border-white/[0.06] bg-[#111018] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">
                #{o.id} <span className="ml-2 text-xs font-normal text-zinc-500">{o.status} · {o.payment_status}</span>
              </p>
              <p className="font-bold">{formatPrice(o.total)}</p>
            </div>

            <p className="mt-2 text-sm text-zinc-400">
              {o.customer_name} · {o.phone}<br />
              {o.address}, {o.city}, {o.state} {o.pincode}
            </p>

            <ul className="mt-3 text-sm text-zinc-300">
              {o.items.map((i) => (
                <li key={i.product_id}>{i.name} × {i.quantity}</li>
              ))}
            </ul>

            {o.tracking_number && (
              <p className="mt-2 text-xs text-zinc-500">Tracking: {o.tracking_number}</p>
            )}

            <div className="mt-4 flex gap-2">
              {o.status === "confirmed" && (
                <button onClick={() => update(o, "shipped")} className="rounded-lg bg-violet-500 px-4 py-2 text-xs font-bold">
                  Mark shipped
                </button>
              )}
              {o.status === "shipped" && (
                <button onClick={() => update(o, "delivered")} className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black">
                  Mark delivered
                </button>
              )}
            </div>
          </li>
        ))}
        {orders.length === 0 && !error && <p className="text-sm text-zinc-500">No orders here.</p>}
      </ul>
    </div>
  );
}