import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  StoreProvider,
  useStore,
} from "./context/StoreContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import TrustBadges from "./components/TrustBadges";
import PromoPopup from "./components/PromoPopup";
import Analytics from "./components/Analytics";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Track from "./pages/Track";
import Wishlist from "./pages/Wishlist";
import MyOrders from "./pages/MyOrders";
import Support from "./pages/Support";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

import {
  About,
  ContactUs,
  FAQ,
  PrivacyPolicy,
  TermsConditions,
  ShippingPolicy,
  ReturnPolicy,
} from "./pages/StaticPages";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSupport from "./pages/AdminSupport";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminOrders from "./pages/AdminOrders";
import AdminInventory from "./pages/AdminInventory";

import {
  AdminCoupons,
  AdminReturns,
  AdminBanners,
  AdminAnalytics,
  AdminSettings,
  AdminReviews,
  AdminNewsletter,
} from "./pages/AdminGeneric";


function Customer({ children }) {
  return (
    <>
      <Header />

      <main className="min-h-[55vh]">
        {children}
      </main>

      <TrustBadges />
      <Footer />
      <WhatsAppButton />
      <PromoPopup />
    </>
  );
}


function CustomerGuard({ children }) {
  const { user, authLoading } = useStore();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (user?.role === "customer") {
    return children;
  }

  const redirectTo =
    location.pathname + location.search;

  return (
    <Navigate
      to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
      replace
    />
  );
}


function AdminGuard({ children }) {
  const { admin, adminLoading } = useStore();

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading admin dashboard...
      </div>
    );
  }

  if (admin?.role === "admin") {
    return children;
  }

  return (
    <Navigate
      to="/admin/login"
      replace
    />
  );
}


export default function App() {
  return (
    <StoreProvider>
      <Analytics />

      <Routes>

        {/* =========================
            CUSTOMER ROUTES
        ========================== */}

        <Route
          path="/"
          element={
            <Customer>
              <Home />
            </Customer>
          }
        />

        <Route
          path="/shop"
          element={
            <Customer>
              <Shop />
            </Customer>
          }
        />

        <Route
          path="/product/:id"
          element={
            <Customer>
              <Product />
            </Customer>
          }
        />

        <Route
          path="/cart"
          element={
            <Customer>
              <Cart />
            </Customer>
          }
        />

        <Route
          path="/wishlist"
          element={
            <Customer>
              <Wishlist />
            </Customer>
          }
        />

        {/* LOGIN REQUIRED */}
        <Route
          path="/checkout"
          element={
            <Customer>
              <CustomerGuard>
                <Checkout />
              </CustomerGuard>
            </Customer>
          }
        />

        <Route
          path="/payment/success"
          element={
            <Customer>
              <PaymentSuccess />
            </Customer>
          }
        />

        <Route
          path="/payment/cancel"
          element={
            <Customer>
              <PaymentCancel />
            </Customer>
          }
        />

        <Route
          path="/track"
          element={
            <Customer>
              <Track />
            </Customer>
          }
        />

        <Route
          path="/login"
          element={
            <Customer>
              <Auth />
            </Customer>
          }
        />

        <Route
          path="/register"
          element={
            <Customer>
              <Auth mode="register" />
            </Customer>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <Customer>
              <ForgotPassword />
            </Customer>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <Customer>
              <ResetPassword />
            </Customer>
          }
        />

        {/* CUSTOMER PROTECTED ROUTES */}

        <Route
          path="/my-orders"
          element={
            <Customer>
              <CustomerGuard>
                <MyOrders />
              </CustomerGuard>
            </Customer>
          }
        />

        <Route
          path="/support"
          element={
            <Customer>
              <CustomerGuard>
                <Support />
              </CustomerGuard>
            </Customer>
          }
        />

        {/* =========================
            STATIC PAGES
        ========================== */}

        <Route
          path="/about"
          element={
            <Customer>
              <About />
            </Customer>
          }
        />

        <Route
          path="/contact"
          element={
            <Customer>
              <ContactUs />
            </Customer>
          }
        />

        <Route
          path="/faq"
          element={
            <Customer>
              <FAQ />
            </Customer>
          }
        />

        <Route
          path="/privacy-policy"
          element={
            <Customer>
              <PrivacyPolicy />
            </Customer>
          }
        />

        <Route
          path="/terms-conditions"
          element={
            <Customer>
              <TermsConditions />
            </Customer>
          }
        />

        <Route
          path="/shipping-policy"
          element={
            <Customer>
              <ShippingPolicy />
            </Customer>
          }
        />

        <Route
          path="/return-policy"
          element={
            <Customer>
              <ReturnPolicy />
            </Customer>
          }
        />


        {/* =========================
            ADMIN AUTH
        ========================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* =========================
            ADMIN DASHBOARD
        ========================== */}

        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >

          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="products"
            element={<AdminProducts />}
          />
          <Route path="categories" element={<AdminCategories/>}/>
          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="inventory"
            element={<AdminInventory />}
          />

          <Route
            path="users"
            element={<AdminUsers />}
          />

          <Route
            path="support"
            element={<AdminSupport />}
          />

          <Route
            path="coupons"
            element={<AdminCoupons />}
          />

          <Route
            path="returns"
            element={<AdminReturns />}
          />

          <Route
            path="banners"
            element={<AdminBanners />}
          />

          <Route
            path="reviews"
            element={<AdminReviews />}
          />

          <Route
            path="newsletter"
            element={<AdminNewsletter />}
          />

          <Route
            path="analytics"
            element={<AdminAnalytics />}
          />

          <Route
            path="settings"
            element={<AdminSettings />}
          />

        </Route>


        {/* =========================
            NOT FOUND
        ========================== */}

        <Route
          path="*"
          element={
            <Customer>
              <NotFound />
            </Customer>
          }
        />

      </Routes>
    </StoreProvider>
  );
}


