import { useEffect, useState } from "react";

import "./App.css";

import AnnouncementBar from "./components/AnnouncementBar";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import ProductSection from "./components/ProductSection";
import NewDropsSection from "./components/NewDropsSection";
import CollectionSection from "./components/CollectionSection";
import PromoBanner from "./components/PromoBanner";
import WhyChooseUs from "./components/WhyChooseUs";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

import ShopPage from "./pages/ShopPage";
import CategoriesPage from "./pages/CategoriesPage";
import NewDropsPage from "./pages/NewDropsPage";
import CollectionsPage from "./pages/CollectionsPage";
import CheckoutPage from "./pages/CheckoutPage";

import PortalGate from "./components/PortalGate";
import AdminLayout from "./admin/AdminLayout";
import AdminOrdersPage from "./admin/AdminOrdersPage";
import AdminSellersPage from "./admin/AdminSellersPage";
import AdminProductsPage from "./admin/Adminproductspage";
import SellerLayout from "./seller/SellerLayout";
import SellerProductsPage from "./seller/SellerProductsPage";
import SellerOrdersPage from "./seller/SellerOrdersPage";

const getPath = () => {
  return window.location.pathname.replace(/\/$/, "") || "/";
};

function HomePage({ onNavigate }) {
  return (
    <>
      <main>
        <Hero onNavigate={onNavigate} />
        <CategorySection onNavigate={onNavigate} />
        <ProductSection onNavigate={onNavigate} />
        <NewDropsSection onNavigate={onNavigate} />
        <CollectionSection onNavigate={onNavigate} />
        <PromoBanner />
        <WhyChooseUs />
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
export default function App() {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const handlePopState = () => {
      setPath(getPath());

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = (href) => {
    if (href.startsWith("/#")) {
      const hash = href.slice(1);

      if (path !== "/") {
        window.history.pushState({}, "", href);
        setPath("/");
      }

      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({
          behavior: "smooth",
        });
      });

      return;
    }

    // Route on the path only, but keep ?category=... in the address bar
    const [pathname] = href.split("?");
    const nextPath = pathname.replace(/\/$/, "") || "/";

    window.history.pushState({}, "", href);

    setPath(nextPath);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };

  // Admin and seller portals: no storefront header, announcement bar or footer
  if (path === "/admin" || path.startsWith("/admin/")) {
    return (
      <PortalGate role="admin">
        <AdminLayout path={path} onNavigate={navigate}>
          {path === "/admin/sellers" ? (
            <AdminSellersPage />
          ) : path === "/admin/products" ? (
            <AdminProductsPage />
          ) : (
            <AdminOrdersPage />
          )}
        </AdminLayout>
      </PortalGate>
    );
  }

  if (path === "/seller" || path.startsWith("/seller/")) {
    return (
      <PortalGate role="seller">
        <SellerLayout path={path} onNavigate={navigate}>
          {path === "/seller/orders" ? <SellerOrdersPage /> : <SellerProductsPage />}
        </SellerLayout>
      </PortalGate>
    );
  }

  const isShopPage = path === "/shop";
  const isCategoriesPage = path === "/categories";
  const isNewDropsPage = path === "/new-drops";
  const isCollectionsPage = path === "/collections";
  const isCheckoutPage = path === "/checkout";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#08070d] text-white">
      <AnnouncementBar />

      <Header
        isShopPage={isShopPage}
        isCategoriesPage={isCategoriesPage}
        isNewDropsPage={isNewDropsPage}
        isCollectionsPage={isCollectionsPage}
        isCheckoutPage={isCheckoutPage}
        onNavigate={navigate}
      />

      {isShopPage ? (
        <ShopPage />
      ) : isCategoriesPage ? (
        <CategoriesPage onNavigate={navigate} />
      ) : isNewDropsPage ? (
        <NewDropsPage />
      ) : isCollectionsPage ? (
        <CollectionsPage />
      ) : isCheckoutPage ? (
        <CheckoutPage onNavigate={navigate} />
      ) : (
                <HomePage onNavigate={navigate} />
      )}
    </div>
  );
}