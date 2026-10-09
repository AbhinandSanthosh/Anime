import { useMemo, useState } from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";

import Footer from "../components/Footer";
import api from "../service/api";
import { useCart } from "../context/CartContext";

const PLACEHOLDER = "/products/placeholder.png";
const FREE_SHIPPING_MIN = 999; // keep in sync with backend orders.py
const SHIPPING_FEE = 49;

const formatPrice = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

const emptyForm = {
  customer_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

// Same rules as the backend (schemas/order.py)
function validate(form) {
  const errors = {};

  if (form.customer_name.trim().length < 2) errors.customer_name = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(form.phone)) errors.phone = "Enter a 10-digit mobile number.";
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email or leave it empty.";
  if (form.address.trim().length < 5) errors.address = "Enter your street address.";
  if (form.city.trim().length < 2) errors.city = "Enter your city.";
  if (form.state.trim().length < 2) errors.state = "Enter your state.";
  if (!/^\d{6}$/.test(form.pincode)) errors.pincode = "Enter a 6-digit pincode.";

  return errors;
}

// Turn FastAPI errors (string or 422 list) into one readable message
function getApiError(err) {
  const detail = err?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => `${item.loc?.slice(-1)[0] ?? "field"}: ${item.msg}`)
      .join(". ");
  }

  if (!err?.response) return "Cannot reach the server. Check your connection and try again.";

  return "Could not place the order. Please try again.";
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </label>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-white/[0.08] bg-[#111018] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60";

// Loads the Cashfree JS SDK once and resolves the Cashfree() factory function
function loadCashfreeSdk() {
  return new Promise((resolve) => {
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(window.Cashfree || null);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage({ onNavigate }) {
  const { items, subtotal, clearCart } = useCart();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const shipping = useMemo(
    () => (subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE),
    [subtotal]
  );
  const total = subtotal + shipping;

  const goTo = (href) => {
    if (onNavigate) onNavigate(href);
    else window.location.assign(href);
  };

  const setField = (name) => (event) => {
    let value = event.target.value;

    // Keep numeric fields clean
    if (name === "phone") value = value.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") value = value.replace(/\D/g, "").slice(0, 6);

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const found = validate(form);
    setErrors(found);
    setSubmitError("");

    if (Object.keys(found).length > 0) return;

    setSubmitting(true);

    // Load the payment SDK first, so we never create an order we can't pay for
    const CashfreeFactory = await loadCashfreeSdk();

    if (!CashfreeFactory) {
      setSubmitError(
        "Could not load the payment window. Check your connection and try again."
      );
      setSubmitting(false);
      return;
    }

    let order;
    let payment;

    try {
      // 1. Create the order. Only ids and quantities are sent; the server sets prices.
      const orderResponse = await api.post("/orders/", {
        customer_name: form.customer_name.trim(),
        phone: form.phone,
        email: form.email.trim() || null,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      });

      order = orderResponse.data;

      // 2. Ask the server to start a Cashfree payment session for that order
      const paymentResponse = await api.post("/payments/create", {
        order_id: order.id,
      });

      payment = paymentResponse.data;
    } catch (err) {
      console.error("Checkout failed:", err);
      setSubmitError(getApiError(err));
      setSubmitting(false);
      return;
    }

    // 3. Open the Cashfree checkout as an in-page modal (UPI QR, cards,
    // netbanking, wallets — whatever is enabled on the account)
    const cashfree = CashfreeFactory({ mode: payment.env === "production" ? "production" : "sandbox" });

    try {
      await cashfree.checkout({
        paymentSessionId: payment.payment_session_id,
        redirectTarget: "_modal",
      });
    } catch (err) {
      console.error("Cashfree checkout error:", err);
      // fall through to a status check below either way — the modal
      // sometimes rejects even when the payment itself went through
    }

    // 4. Never trust the popup's own result. Ask the server, which asks
    // Cashfree directly, whether the payment actually succeeded.
    try {
      const statusResponse = await api.get(`/payments/status/${order.id}`);
      const updated = statusResponse.data;

      if (updated.payment_status === "paid") {
        setPlacedOrder(updated);
        clearCart();
      } else if (updated.status === "cancelled") {
        setSubmitError("Payment was not completed, so this order was cancelled. Your cart is still here.");
      } else {
        setSubmitError(
          "We couldn't confirm your payment yet. If money was deducted, it will reflect shortly — " +
          `please keep your order number #${order.id} and contact support if it doesn't.`
        );
      }
    } catch (err) {
      console.error("Status check failed:", err);
      setSubmitError(
        `We could not confirm your payment. Please keep your order number #${order.id} and contact support. ${getApiError(err)}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ===================== ORDER PLACED =====================

  if (placedOrder) {
    return (
      <>
        <main className="min-h-screen bg-[#08070d] px-4 py-16 text-white sm:px-6">
          <div className="mx-auto max-w-xl">
            <div className="rounded-2xl border border-white/[0.06] bg-[#111018] p-8 text-center">
              <CheckCircle2 size={44} className="mx-auto text-violet-400" />

              <h1 className="mt-4 text-2xl font-black">Order confirmed</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Your order number is{" "}
                <span className="font-bold text-white">#{placedOrder.id}</span>.
              </p>

              <ul className="mt-6 space-y-3 border-t border-white/[0.07] pt-6 text-left">
                {placedOrder.items.map((item) => (
                  <li key={item.product_id} className="flex items-center justify-between gap-4 text-sm">
                    <span className="min-w-0 truncate text-zinc-300">
                      {item.name} <span className="text-zinc-500">× {item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2 border-t border-white/[0.07] pt-6 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(placedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span>{placedOrder.shipping_fee === 0 ? "Free" : formatPrice(placedOrder.shipping_fee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(placedOrder.total)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Payment</span>
                  <span className="capitalize">{placedOrder.payment_status}</span>
                </div>
              </div>

              <p className="mt-6 text-xs text-zinc-500">
                Shipping to {placedOrder.address}, {placedOrder.city},{" "}
                {placedOrder.state} {placedOrder.pincode}
              </p>

              <button
                type="button"
                onClick={() => goTo("/shop")}
                className="mt-8 h-12 w-full rounded-xl bg-white text-sm font-bold text-black transition hover:bg-violet-500 hover:text-white"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ===================== EMPTY CART =====================

  if (items.length === 0) {
    return (
      <>
        <main className="flex min-h-[70vh] items-center justify-center bg-[#08070d] px-4 text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05] text-zinc-500">
              <ShoppingBag size={24} />
            </div>

            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="mt-2 text-sm text-zinc-500">Add something to your cart before checking out.</p>

            <button
              type="button"
              onClick={() => goTo("/shop")}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-violet-500 hover:text-white"
            >
              Go to Shop
            </button>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ===================== CHECKOUT FORM =====================

  return (
    <>
      <main className="min-h-screen bg-[#08070d] text-white">
        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">Checkout</h1>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]"
          >
            {/* DETAILS */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold">Delivery details</h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" error={errors.customer_name}>
                  <input
                    className={inputClass}
                    value={form.customer_name}
                    onChange={setField("customer_name")}
                    autoComplete="name"
                    placeholder="Febin Farooque"
                  />
                </Field>

                <Field label="Mobile number" error={errors.phone}>
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={setField("phone")}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="9876543210"
                  />
                </Field>
              </div>

              <Field label="Email (optional)" error={errors.email}>
                <input
                  className={inputClass}
                  type="email"
                  value={form.email}
                  onChange={setField("email")}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </Field>

              <Field label="Address" error={errors.address}>
                <textarea
                  className={`${inputClass} h-24 resize-none py-3`}
                  value={form.address}
                  onChange={setField("address")}
                  autoComplete="street-address"
                  placeholder="House number, street, area"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="City" error={errors.city}>
                  <input
                    className={inputClass}
                    value={form.city}
                    onChange={setField("city")}
                    autoComplete="address-level2"
                  />
                </Field>

                <Field label="State" error={errors.state}>
                  <input
                    className={inputClass}
                    value={form.state}
                    onChange={setField("state")}
                    autoComplete="address-level1"
                  />
                </Field>

                <Field label="Pincode" error={errors.pincode}>
                  <input
                    className={inputClass}
                    value={form.pincode}
                    onChange={setField("pincode")}
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />
                </Field>
              </div>
            </div>

            {/* SUMMARY */}
            <aside className="h-fit rounded-2xl border border-white/[0.06] bg-[#111018] p-6">
              <h2 className="text-lg font-bold">Order summary</h2>

              <ul className="mt-5 space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <img
                      src={item.image || PLACEHOLDER}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = PLACEHOLDER;
                      }}
                      className="h-16 w-14 shrink-0 rounded-lg bg-zinc-900 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">Qty {item.quantity}</p>
                    </div>

                    <span className="text-sm font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-2 border-t border-white/[0.07] pt-5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {submitError && (
                <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 h-12 w-full rounded-xl bg-violet-500 text-sm font-bold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Processing..." : `Pay ${formatPrice(total)}`}
              </button>

              <button
                type="button"
                onClick={() => goTo("/shop")}
                className="mt-3 w-full text-xs text-zinc-500 transition hover:text-white"
              >
                Back to shop
              </button>
            </aside>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}