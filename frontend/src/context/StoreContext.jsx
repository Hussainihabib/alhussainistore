import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";

const C = createContext();
export const useStore = () => useContext(C);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("ahg_cart") || "[]"));
  // Guests keep a local-only wishlist. Once a customer is logged in, the
  // wishlist is loaded from and kept in sync with the backend so it
  // persists across devices and is scoped to that customer only.
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("ahg_wishlist") || "[]"));

  useEffect(() => {
    if (!user) localStorage.setItem("ahg_wishlist", JSON.stringify(wishlist));
  }, [wishlist, user]);
  useEffect(() => localStorage.setItem("ahg_cart", JSON.stringify(cart)), [cart]);

  useEffect(() => {
    const token = localStorage.getItem("ahg_customer_token");
    if (!token) { setAuthLoading(false); return; }
    api.get("/auth/me")
      .then((r) => r.data?.role === "customer" && setUser(r.data))
      .catch(() => localStorage.removeItem("ahg_customer_token"))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("ahg_admin_token");
    if (!token) { setAdminLoading(false); return; }
    api.get("/auth/admin/me")
      .then((r) => setAdmin(r.data))
      .catch(() => localStorage.removeItem("ahg_admin_token"))
      .finally(() => setAdminLoading(false));
  }, []);

  // Load the customer's own wishlist from the backend once they're
  // authenticated, replacing whatever guest wishlist was in local state.
  useEffect(() => {
    if (!user) return;
    api.get("/wishlist").then((r) => setWishlist(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [user]);

  const login = async (data) => {
    const r = await api.post("/auth/login", { ...data, role: "customer" });
    localStorage.setItem("ahg_customer_token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (data) => {
    const r = await api.post("/auth/register", data);
    localStorage.setItem("ahg_customer_token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const googleLogin = async (credential) => {
    const r = await api.post("/auth/google", { credential });
    localStorage.setItem("ahg_customer_token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const adminLogin = async (data) => {
    const r = await api.post("/auth/admin/login", data);
    localStorage.setItem("ahg_admin_token", r.data.token);
    setAdmin(r.data.user);
    return r.data.user;
  };

  const logout = () => {
    localStorage.removeItem("ahg_customer_token");
    setUser(null);
    // Don't leak the previous customer's wishlist to whoever uses this
    // browser next; fall back to an empty local guest wishlist.
    setWishlist([]);
    localStorage.removeItem("ahg_wishlist");
  };

  const adminLogout = () => {
    localStorage.removeItem("ahg_admin_token");
    setAdmin(null);
  };

  const addCart = (item) => setCart((c) => {
    const x = c.find((i) => i.product._id === item.product._id && i.variantId === item.variantId);
    return x ? c.map((i) => i === x ? { ...i, quantity: i.quantity + item.quantity } : i) : [...c, item];
  });

  // Adds/removes a product from the wishlist. Persists to the backend for
  // logged-in customers; keeps it in local state (and localStorage) only
  // for guests.
  const toggleWishlist = async (product) => {
    const isWished = wishlist.some((x) => x._id === product._id);
    if (!user) {
      setWishlist(isWished ? wishlist.filter((x) => x._id !== product._id) : [...wishlist, product]);
      return;
    }
    try {
      if (isWished) {
        const r = await api.delete(`/wishlist/${product._id}`);
        setWishlist(Array.isArray(r.data) ? r.data : []);
      } else {
        const r = await api.post("/wishlist", { productId: product._id });
        setWishlist(Array.isArray(r.data) ? r.data : []);
      }
    } catch {
      // Silently ignore; wishlist state stays as it was on failure.
    }
  };

  const value = useMemo(() => ({
    user, setUser, admin, setAdmin, authLoading, adminLoading,
    cart, setCart, wishlist, setWishlist, toggleWishlist,
    login, register, googleLogin, adminLogin, logout, adminLogout, addCart,
  }), [user, admin, authLoading, adminLoading, cart, wishlist]);

  return <C.Provider value={value}>{children}</C.Provider>;
}
