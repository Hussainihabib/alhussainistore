import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Boxes, Tag, Undo2, Image,
  Settings, BarChart3, LogOut, Users, Headphones, Menu, X, Star, Mail, FolderTree
} from "lucide-react";
import { useState } from "react";
import { useStore } from "../context/StoreContext";

const links = [
  ["Dashboard", "/admin", LayoutDashboard], ["Products", "/admin/products", Package],
    ["Categories", "/admin/categories", FolderTree],

  ["Orders", "/admin/orders", ShoppingBag], ["Inventory", "/admin/inventory", Boxes],
  ["Customers", "/admin/users", Users], ["Support", "/admin/support", Headphones],
  ["Coupons", "/admin/coupons", Tag], ["Returns", "/admin/returns", Undo2],
  ["Banners", "/admin/banners", Image], ["Reviews", "/admin/reviews", Star],
  ["Newsletter", "/admin/newsletter", Mail], ["Analytics", "/admin/analytics", BarChart3],
  ["Settings", "/admin/settings", Settings],
];

export default function AdminLayout() {
  const { adminLogout } = useStore();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const close = () => setOpen(false);

  const sidebar = (
    <>
      <div className="flex items-center justify-between gap-3 mb-7">
        <Link to="/admin" onClick={close} className="font-serif text-lg md:text-xl font-bold">
          AL-HUSSAINI <span className="text-gold">ADMIN</span>
        </Link>
        <button className="md:hidden p-2" onClick={close} aria-label="Close menu"><X size={20} /></button>
      </div>
      <nav className="grid gap-1">
        {links.map(([name, path, Icon]) => {
          const active = location.pathname === path;
          return <Link key={name} to={path} onClick={close}
            className={`flex gap-3 items-center p-3 rounded-xl text-sm transition ${active ? "bg-white/15" : "hover:bg-white/10"}`}>
            <Icon size={18} />{name}
          </Link>;
        })}
      </nav>
      <button onClick={adminLogout} className="mt-7 w-full flex gap-2 items-center p-3 rounded-xl hover:bg-white/10 text-sm">
        <LogOut size={18} /> Logout
      </button>
    </>
  );

  return <div className="min-h-screen bg-cream">
    <div className="md:hidden sticky top-0 z-50 bg-brand text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <Link to="/admin" className="font-serif font-bold">AL-HUSSAINI <span className="text-gold">ADMIN</span></Link>
      <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
    </div>
    {open && <div className="fixed inset-0 z-[60] md:hidden">
      <button aria-label="Close menu" onClick={close} className="absolute inset-0 bg-black/45" />
      <aside className="relative z-10 w-[82vw] max-w-xs min-h-screen bg-brand text-white p-5 shadow-2xl">{sidebar}</aside>
    </div>}
    <div className="md:flex min-h-screen">
      <aside className="hidden md:block bg-brand text-white w-64 shrink-0 p-5">{sidebar}</aside>
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden"><Outlet /></main>
    </div>
  </div>;
}
