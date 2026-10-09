import { useEffect, useState } from "react";
import api from "../service/api";

const TTL_MS = 30000; // reuse the result for 30 seconds, so sections share one request

let cache = null;
let cachedAt = 0;
let inflight = null;

const normalize = (p) => ({
  id: p.id,
  name: p.name || "Unnamed product",
  description: p.description || "",
  category: (p.category || "Other").trim(),
  collection: (p.collection || "").trim(),
  price: Number(p.price) || 0,
  original_price:
    p.original_price !== null && p.original_price !== undefined
      ? Number(p.original_price)
      : null,
  image: p.image || null,
  rating: Number(p.rating) || 0,
  reviews: Number(p.reviews) || 0,
  is_new: Boolean(p.is_new),
  is_featured: Boolean(p.is_featured),
  stock: Number(p.stock) || 0,
});

function fetchProducts() {
  if (cache && Date.now() - cachedAt < TTL_MS) return Promise.resolve(cache);

  if (!inflight) {
    inflight = api
      .get("/products/")
      .then(({ data }) => {
        const list = Array.isArray(data)
          ? data
          : data?.products || data?.results || data?.data || [];
        cache = list.map(normalize);
        cachedAt = Date.now();
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

export default function useProducts() {
  const [products, setProducts] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    fetchProducts()
      .then((list) => {
        if (alive) {
          setProducts(list);
          setError("");
        }
      })
      .catch(() => {
        if (alive) setError("Unable to load products.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { products, loading, error };
}