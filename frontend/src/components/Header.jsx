import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Heart,
  ShoppingBag,
  Search,
  X,
  User,
  LogOut,
  Package,
  Headphones,
  MapPin,
  Info,
} from "lucide-react";

import { useStore } from "../context/StoreContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const nav = useNavigate();

  const { cart, wishlist, user, logout } = useStore();

  // Main Navbar Links
  const links = [
    {
      name: "SHOP",
      path: "/shop",
      icon: ShoppingBag,
    },
    {
      name: "ABOUT US",
      path: "/about",
      icon: Info,
    },
    {
      name: "SUPPORT",
      path: "/support",
      icon: Headphones,
    },
    {
      name: "MY ORDERS",
      path: "/my-orders",
      icon: Package,
      customerOnly: true,
    },
    {
      name: "ORDER TRACKER",
      path: "/track",
      icon: MapPin,
    },
  ];

  const signOut = () => {
    logout();
    setOpen(false);
    nav("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const searchValue = q.trim();

    if (!searchValue) {
      nav("/shop");
      return;
    }

    nav(`/shop?search=${encodeURIComponent(searchValue)}`);
  };

  const closeMobileMenu = () => {
    setOpen(false);
  };

  const visibleLinks = links.filter((link) => {
    if (link.customerOnly) {
      return user?.role === "customer";
    }

    return true;
  });

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-brand text-white text-xs py-2">
        <div className="container flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-center">
          <span>Cash on Delivery Available</span>

          <span className="hidden sm:inline">✓ 7 Days Easy Return</span>

          <span className="hidden md:inline">
            ✓ Premium Kids Clothing
          </span>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="bg-brand text-white sticky top-0 z-40 shadow-md">
        {/* TOP HEADER */}
        <div className="container h-20 flex items-center gap-3">
          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 transition"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>

          {/* LOGO */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="font-serif text-base sm:text-lg md:text-2xl font-bold whitespace-nowrap leading-tight"
          >
            AL-HUSSAINI{" "}
            <span className="text-gold">GARMENTS</span>
          </Link>

          {/* DESKTOP SEARCH */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-auto bg-white rounded-full overflow-hidden shadow-sm"
          >
            <input
              className="w-full px-5 py-3 text-sm text-stone-800 outline-none"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
            />

            <button
              type="submit"
              className="text-brand px-4 hover:bg-stone-100 transition"
              aria-label="Search"
            >
              <Search size={19} />
            </button>
          </form>

          {/* RIGHT SIDE ICONS */}
          <div className="flex gap-3 sm:gap-4 ml-auto items-center">
            {/* MOBILE SEARCH */}
            <Link
              to="/shop"
              className="md:hidden p-1.5 hover:text-gold transition"
              aria-label="Search Products"
            >
              <Search size={20} />
            </Link>

            {/* WISHLIST */}
            <Link
              to="/wishlist"
              className="relative p-1.5 hover:text-gold transition"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart size={20} />

              {wishlist?.length > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] bg-gold text-brand rounded-full min-w-[16px] h-4 px-1 grid place-items-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* CART */}
            <Link
              to="/cart"
              className="relative p-1.5 hover:text-gold transition"
              aria-label="Cart"
              title="Cart"
            >
              <ShoppingBag size={20} />

              {cart?.length > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] bg-gold text-brand rounded-full min-w-[16px] h-4 px-1 grid place-items-center font-bold">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* ACCOUNT / USER ICON */}
            {user ? (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={signOut}
                  className="p-1.5 hover:text-gold transition"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-1.5 hover:text-gold transition"
                aria-label="Account"
                title="Login / Account"
              >
                <User size={20} />
              </Link>
            )}
          </div>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:block border-t border-white/10">
          <div className="container flex items-center justify-center gap-7 xl:gap-10 py-3">
            {visibleLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center gap-2 text-xs font-bold tracking-wide hover:text-gold transition-colors whitespace-nowrap"
                >
                  <Icon size={16} />

                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* MOBILE MENU */}
        {open && (
          <div className="lg:hidden border-t border-white/10 bg-brand">
            <div className="container py-4 space-y-1">
              {/* MOBILE SEARCH */}
              <form
                onSubmit={(e) => {
                  handleSearch(e);
                  setOpen(false);
                }}
                className="flex md:hidden bg-white rounded-xl overflow-hidden mb-4"
              >
                <input
                  className="flex-1 px-4 py-3 text-sm text-stone-800 outline-none"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products..."
                />

                <button
                  type="submit"
                  className="px-4 text-brand"
                >
                  <Search size={19} />
                </button>
              </form>

              {/* NAV LINKS */}
              {visibleLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition font-medium"
                  >
                    <Icon size={19} />

                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {/* ACCOUNT SECTION */}
              {user ? (
                <>
                  <div className="border-t border-white/10 my-3" />

                  <div className="px-3 py-2 text-xs text-white/60">
                    Logged in as
                  </div>

                  <div className="px-3 pb-2 font-medium truncate">
                    {user.name || user.email || "Customer"}
                  </div>

                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 text-left transition"
                  >
                    <LogOut size={19} />

                    <span>LOGOUT</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-white/10 my-3" />

                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 transition"
                  >
                    <User size={19} />

                    <span>LOGIN / ACCOUNT</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}