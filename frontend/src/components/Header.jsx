import { useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "New Drops", href: "/new-drops" },
  { label: "Collections", href: "/collections" },
];

export default function Header({
  isShopPage,
  isCategoriesPage,
  isNewDropsPage,
  isCollectionsPage,
  onNavigate,
}) {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  const handleNavigation = (event, href) => {
    event.preventDefault();
    setOpen(false);
    onNavigate(href);
  };

  const isActive = (label) => {
    if (label === "Home") {
      return (
        !isShopPage &&
        !isCategoriesPage &&
        !isNewDropsPage &&
        !isCollectionsPage
      );
    }

    if (label === "Shop") return isShopPage;
    if (label === "Categories") return isCategoriesPage;
    if (label === "New Drops") return isNewDropsPage;
    if (label === "Collections") return isCollectionsPage;

    return false;
  };

  // Shared cart badge (hidden when the cart is empty)
  const CartBadge = () =>
    totalItems > 0 ? (
      <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[9px] font-bold text-white">
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    ) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#08070d]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:h-[76px] lg:px-8">
        {/* LOGO */}
        <a
          href="/"
          onClick={(event) => handleNavigation(event, "/")}
          className="text-[24px] font-black tracking-[-1.5px]"
        >
          ANIM
          <span className="text-violet-500">ORA</span>
        </a>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => {
            const active = isActive(link.label);

            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(event) => handleNavigation(event, link.href)}
                className={`relative py-2 text-sm font-medium transition-colors ${
                  active ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}

                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-violet-500" />
                )}
              </a>
            );
          })}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            aria-label="Account"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <User size={18} />
          </button>

          <button
            type="button"
            aria-label="Wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Heart size={18} />
          </button>

          {/* DARK / LIGHT TOGGLE */}
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Shopping cart, ${totalItems} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ShoppingBag size={18} />
            <CartBadge />
          </button>
        </div>

        {/* MOBILE: THEME + CART + MENU */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle className="border border-white/10" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCartOpen(true);
            }}
            aria-label={`Shopping cart, ${totalItems} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white"
          >
            <ShoppingBag size={18} />
            <CartBadge />
          </button>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      {open && (
        <div className="border-t border-white/[0.07] bg-[#0b0a10] px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const active = isActive(link.label);

              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(event) => handleNavigation(event, link.href)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-violet-500 text-white"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          onNavigate("/checkout");
        }}
      />
    </header>
  );
}