import { useCallback, useEffect, useRef, useState } from "react";
import api from "../service/api";

const CATEGORIES = ["Apparel", "Figures", "Accessories", "Wall Art"];
const MAX_MB = 3;

const input =
  "h-11 rounded-xl border border-white/[0.08] bg-[#0d1712] px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/60";

const empty = {
  name: "",
  category: CATEGORIES[0],
  price: "",
  original_price: "",
  stock: "",
  image: "",
  description: "",
  is_new: false,
};

function getError(err, fallback) {
  const d = err?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d.length) {
    return d.map((x) => `${x.loc?.slice(-1)[0] ?? "field"}: ${x.msg}`).join(". ");
  }
  return fallback;
}

const formatPrice = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  const load = useCallback(
    () => api.get("/seller/products").then((r) => setProducts(r.data)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  const categoryOptions = CATEGORIES.includes(form.category)
    ? CATEGORIES
    : [form.category, ...CATEGORIES];

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : "",
      stock: String(p.stock),
      image: p.image || "",
      description: p.description || "",
      is_new: !!p.is_new,
    });
    setError("");
    setNotice("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(empty);
    setError("");
  };

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG or WEBP).");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB} MB.`);
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const { data } = await api.post("/seller/upload", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, image: data.url }));
      setError("");
    } catch (err) {
      setError(getError(err, "Image upload failed."));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || null,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      stock: Number(form.stock),
      image: form.image || null,
      is_new: form.is_new,
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/seller/products/${editingId}`, payload);
        setNotice("Product updated.");
      } else {
        await api.post("/seller/products", payload);
        setNotice("Product added.");
      }
      setEditingId(null);
      setForm(empty);
      setError("");
      load();
    } catch (err) {
      setError(getError(err, "Check the product details."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/seller/products/${p.id}`);
      if (editingId === p.id) cancelEdit();
      setNotice("Product deleted.");
      setError("");
      load();
    } catch (err) {
      setNotice("");
      setError(getError(err, "Could not delete the product."));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black">My products</h1>

      <form
        ref={formRef}
        onSubmit={submit}
        className="mt-6 grid gap-3 rounded-2xl border border-white/[0.06] p-4 sm:grid-cols-4"
      >
        <p className="text-sm font-bold text-emerald-400 sm:col-span-4">
          {editingId ? "Edit product" : "Add a new product"}
        </p>

        <input className={`${input} sm:col-span-2`} placeholder="Name" value={form.name} onChange={set("name")} />

        <select className={input} value={form.category} onChange={set("category")}>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input className={input} type="number" placeholder="Stock" value={form.stock} onChange={set("stock")} />

        <input className={input} type="number" placeholder="Price ₹" value={form.price} onChange={set("price")} />
        <input className={input} type="number" placeholder="Original price ₹ (optional)" value={form.original_price} onChange={set("original_price")} />

        <div className="flex items-center gap-4 rounded-xl border border-dashed border-white/[0.12] bg-[#0d1712] p-3 sm:col-span-4">
          {form.image ? (
            <img src={form.image} alt="Preview" className="h-20 w-20 rounded-lg object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] text-zinc-500">
              No image
            </div>
          )}

          <div className="min-w-0 flex-1">
            <label className="inline-block cursor-pointer rounded-lg bg-white/[0.08] px-4 py-2 text-xs font-bold hover:bg-white/[0.14]">
              {uploading ? "Uploading..." : form.image ? "Change image" : "Upload image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={pickImage}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {form.image && !uploading && (
              <button
                type="button"
                onClick={() => setForm({ ...form, image: "" })}
                className="ml-3 text-xs text-zinc-500 hover:text-white"
              >
                Remove
              </button>
            )}

            <p className="mt-2 text-xs text-zinc-500">JPG, PNG or WEBP, up to {MAX_MB} MB.</p>
          </div>
        </div>

        <textarea
          className={`${input} h-24 resize-none py-3 sm:col-span-4`}
          placeholder="Description (optional)"
          value={form.description}
          onChange={set("description")}
        />

        <label className="flex items-center gap-2 text-sm text-zinc-300 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.is_new}
            onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
          />
          Mark as new arrival
        </label>

        <div className="flex gap-3 sm:col-span-2">
          <button
            disabled={uploading || saving}
            className="h-11 flex-1 rounded-xl bg-emerald-500 text-sm font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Save changes" : "Add product"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="h-11 rounded-xl bg-white/[0.08] px-5 text-sm font-bold hover:bg-white/[0.14]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {notice && !error && <p className="mt-3 text-sm text-emerald-400">{notice}</p>}

      <ul className="mt-8 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-[#0d1712]">
        {products.map((p) => (
          <li
            key={p.id}
            className={`flex flex-wrap items-center gap-4 px-5 py-4 ${
              editingId === p.id ? "bg-emerald-500/[0.06]" : ""
            }`}
          >
            {p.image ? (
              <img src={p.image} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-zinc-900 object-cover" />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-lg bg-white/[0.05]" />
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.name}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {p.category} · {formatPrice(p.price)} ·{" "}
                {p.stock > 0 ? `${p.stock} in stock` : <span className="text-red-400">Out of stock</span>}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => startEdit(p)}
                className="rounded-lg bg-white/[0.08] px-4 py-2 text-xs font-bold hover:bg-white/[0.14]"
              >
                Edit
              </button>
              <button
                onClick={() => remove(p)}
                className="rounded-lg bg-red-500/15 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-500/25"
              >
                Delete
              </button>
            </div>
          </li>
        ))}

        {products.length === 0 && (
          <li className="px-5 py-4 text-sm text-zinc-500">You have no products yet.</li>
        )}
      </ul>
    </div>
  );
}