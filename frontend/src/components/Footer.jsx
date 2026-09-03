import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, MessageCircle, Mail, Phone } from "lucide-react";
import api from "../api";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setBusy(true);
      setMsg("");
      await api.post("/newsletter/subscribe", { email: email.trim() });
      setMsg("Thanks for subscribing!");
      setEmail("");
    } catch (err) {
      setMsg(err.response?.data?.message || "Unable to subscribe right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <b className="text-gold">NEWSLETTER</b>
      <p className="text-sm text-white/70 mt-3">Subscribe to get special offers and updates.</p>
      <form onSubmit={submit} className="flex mt-3 gap-2">
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none"
        />
        <button disabled={busy} className="bg-gold text-brand text-sm font-bold px-4 rounded-lg whitespace-nowrap">
          {busy ? "..." : "Subscribe"}
        </button>
      </form>
      {msg && <p className="text-xs text-white/80 mt-2">{msg}</p>}
    </div>
  );
}

export default function Footer(){
 return <footer className="bg-brand text-white mt-12"><div className="container py-12 grid gap-8 md:grid-cols-4">
  <div><h2 className="font-serif text-2xl font-bold">AL-HUSSAINI <span className="text-gold">GARMENTS</span></h2><p className="text-sm text-white/70 mt-3">Quality kids clothing with comfortable styles for everyday and special occasions.</p></div>
  <div><b className="text-gold">COMPANY</b><div className="grid gap-2 mt-3 text-sm text-white/80"><Link to="/about">About Us</Link><Link to="/contact">Contact Us</Link><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms-conditions">Terms &amp; Conditions</Link><Link to="/return-policy">Return &amp; Exchange Policy</Link></div></div>
  <div><b className="text-gold">CUSTOMER SERVICE</b><div className="grid gap-2 mt-3 text-sm text-white/80"><Link to="/login">My Account</Link><Link to="/my-orders">My Orders</Link><Link to="/track">Track Order</Link><Link to="/shipping-policy">Shipping Policy</Link><Link to="/faq">FAQ</Link></div></div>
  <NewsletterForm/>
 </div>
 <div className="border-t border-white/10"><div className="container py-8 grid gap-3 sm:flex sm:items-center sm:justify-between"><b className="text-gold text-xs">CONTACT</b><div className="flex flex-wrap gap-5 text-sm text-white/80"><a href="https://wa.me/923352219829" target="_blank" rel="noreferrer" className="flex items-center gap-2"><MessageCircle size={18}/> WhatsApp</a><a href="https://www.facebook.com/share/1ERSYkDqom/" target="_blank" rel="noreferrer" className="flex items-center gap-2"><Facebook size={18}/> Facebook</a><a href="https://www.instagram.com/alhussainigarments?igsi=MXB0em9qbzJuMHNnYg==/" target="_blank" rel="noreferrer" className="flex items-center gap-2"><Instagram size={18}/> Instagram</a><span className="flex items-center gap-2"><Mail size={18}/> alhussainigarmentstore@gmail.com</span><span className="flex items-center gap-2"><Phone size={18}/> Contact us for orders</span></div></div></div>
 <div className="border-t border-white/10"><div className="container py-4 text-xs text-white/60 flex flex-col sm:flex-row justify-between gap-2"><span>© {new Date().getFullYear()} Al-Hussaini Garments. All rights reserved.</span><div className="flex gap-3"><Link to="/privacy-policy">Privacy</Link><Link to="/terms-conditions">Terms</Link><Link to="/return-policy">Returns</Link></div></div></div></footer>
}
