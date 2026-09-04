import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
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

      await api.post("/newsletter/subscribe", {
        email: email.trim(),
      });

      setMsg("Thanks for subscribing!");
      setEmail("");
    } catch (err) {
      setMsg(
        err.response?.data?.message ||
          "Unable to subscribe right now."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0">
      <b className="text-gold">
        NEWSLETTER
      </b>

      <p className="text-sm text-white/70 mt-3">
        Subscribe to get special offers and updates.
      </p>

      <form
        onSubmit={submit}
        className="flex flex-col sm:flex-row mt-3 gap-2 w-full"
      >
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full min-w-0 flex-1 rounded-lg px-3 py-3 text-sm text-stone-800 outline-none"
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full sm:w-auto bg-gold text-brand text-sm font-bold px-4 py-3 rounded-lg whitespace-nowrap disabled:opacity-60"
        >
          {busy ? "..." : "Subscribe"}
        </button>
      </form>

      {msg && (
        <p className="text-xs text-white/80 mt-2">
          {msg}
        </p>
      )}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-brand text-white mt-12 w-full max-w-full overflow-hidden">

      {/* Main Footer */}
      <div className="container py-12 grid gap-8 md:grid-cols-4">

        {/* Brand */}
        <div className="min-w-0">
          <h2 className="font-serif text-2xl font-bold">
            AL-HUSSAINI{" "}
            <span className="text-gold">
              GARMENTS
            </span>
          </h2>

          <p className="text-sm text-white/70 mt-3">
            Quality kids clothing with comfortable styles for everyday
            and special occasions.
          </p>
        </div>

        {/* Company */}
        <div className="min-w-0">
          <b className="text-gold">
            COMPANY
          </b>

          <div className="grid gap-2 mt-3 text-sm text-white/80">
            <Link to="/about">
              About Us
            </Link>

            <Link to="/contact">
              Contact Us
            </Link>

            <Link to="/privacy-policy">
              Privacy Policy
            </Link>

            <Link to="/terms-conditions">
              Terms & Conditions
            </Link>

            <Link to="/return-policy">
              Return & Exchange Policy
            </Link>
          </div>
        </div>

        {/* Customer Service */}
        <div className="min-w-0">
          <b className="text-gold">
            CUSTOMER SERVICE
          </b>

          <div className="grid gap-2 mt-3 text-sm text-white/80">
            <Link to="/login">
              My Account
            </Link>

            <Link to="/my-orders">
              My Orders
            </Link>

            <Link to="/track">
              Track Order
            </Link>

            <Link to="/shipping-policy">
              Shipping Policy
            </Link>

            <Link to="/faq">
              FAQ
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <NewsletterForm />
      </div>

      {/* Contact & Social */}
      <div className="border-t border-white/10">
        <div className="container py-8 grid gap-5 sm:flex sm:items-center sm:justify-between">

          <b className="text-gold text-xs">
            CONTACT
          </b>

          <div className="flex flex-wrap gap-x-5 gap-y-4 text-sm text-white/80 min-w-0">

            {/* WhatsApp */}
            <a
              href="https://wa.me/923352219829"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 min-w-0"
            >
              <MessageCircle
                size={18}
                className="shrink-0"
              />

              <span>
                WhatsApp
              </span>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/1ERSYkDqom/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 min-w-0"
            >
              <FaFacebookF
                size={18}
                className="shrink-0"
              />

              <span>
                Facebook
              </span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/alhussainigarments?igsh=MXB0em9qbzJuMHNnYg=="
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 min-w-0"
            >
              <FaInstagram
                size={18}
                className="shrink-0"
              />

              <span>
                Instagram
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:alhussainigarmentstore@gmail.com"
              className="flex items-center gap-2 min-w-0 break-all"
            >
              <Mail
                size={18}
                className="shrink-0"
              />

              <span>
                alhussainigarmentstore@gmail.com
              </span>
            </a>

            {/* Phone */}
            <span className="flex items-center gap-2 min-w-0">
              <Phone
                size={18}
                className="shrink-0"
              />

              <span>
                Contact us for orders
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="container py-4 text-xs text-white/60 flex flex-col sm:flex-row justify-between gap-3">

          <span>
            © {new Date().getFullYear()} Al-Hussaini Garments.
            All rights reserved.
          </span>

          <div className="flex flex-wrap gap-3">
            <Link to="/privacy-policy">
              Privacy
            </Link>

            <Link to="/terms-conditions">
              Terms
            </Link>

            <Link to="/return-policy">
              Returns
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}