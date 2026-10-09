import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { useCart } from "../context/CartContext";

const PLACEHOLDER = "/products/placeholder.png";
const FREE_SHIPPING_MIN = 999; // matches the announcement bar

const formatPrice = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, updateQuantity, removeItem, clearCart, totalItems, subtotal } =
    useCart();

  // Close on Escape, lock page scroll while open
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const remainingForFreeShipping = Math.max(FREE_SHIPPING_MIN - subtotal, 0);
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_MIN) * 100, 100);

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = PLACEHOLDER;
  };

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* PANEL */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0b0a10] text-white">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <h2 className="text-lg font-bold">
            Your Cart
            {totalItems > 0 && (
              <span className="ml-2 text-sm font-medium text-zinc-500">
                ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
            )}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] transition hover:bg-white/[0.12]"
          >
            <X size={18} />
          </button>
        </div>

        {/* EMPTY STATE */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05] text-zinc-500">
              <ShoppingBag size={24} />
            </div>

            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="mt-2 text-sm text-zinc-500">
              Add something from the shop and it will show up here.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-violet-500 hover:text-white"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* FREE SHIPPING PROGRESS */}
            <div className="border-b border-white/[0.07] px-5 py-4">
              <p className="text-xs text-zinc-400">
                {remainingForFreeShipping > 0
                  ? `Add ${formatPrice(remainingForFreeShipping)} more for free shipping`
                  : "You've unlocked free shipping"}
              </p>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            {/* ITEMS */}
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <img
                    src={item.image || PLACEHOLDER}
                    alt={item.name}
                    onError={handleImageError}
                    className="h-24 w-20 shrink-0 rounded-xl bg-zinc-900 object-cover"
                  />

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                          {item.category}
                        </p>
                        <h3 className="line-clamp-2 text-sm font-semibold">
                          {item.name}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 text-zinc-500 transition hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* QUANTITY */}
                      <div className="flex items-center rounded-lg border border-white/[0.08]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="flex h-8 w-8 items-center justify-center text-zinc-400 transition hover:text-white"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase quantity"
                          className="flex h-8 w-8 items-center justify-center text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="text-sm font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* FOOTER */}
            <div className="border-t border-white/[0.07] px-5 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Subtotal</span>
                <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
              </div>

              <p className="mt-1 text-xs text-zinc-600">
                Shipping and taxes are calculated at checkout.
              </p>

              <button
                type="button"
                onClick={onCheckout}
                className="mt-4 h-12 w-full rounded-xl bg-violet-500 text-sm font-bold text-white transition hover:bg-violet-400"
              >
                Checkout
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="mt-3 w-full text-xs text-zinc-500 transition hover:text-white"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}