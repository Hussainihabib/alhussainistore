import { useState } from "react";
import api from "../api";

/* =========================================================
   STATIC / INFORMATIONAL CUSTOMER PAGES
   About, Contact, FAQ, Privacy, Terms, Shipping & Return Policy
========================================================= */

function PageShell({ title, subtitle, children }) {
  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-3xl font-serif">{title}</h1>
      {subtitle && <p className="text-stone-500 mt-2">{subtitle}</p>}
      <div className="card p-6 sm:p-8 mt-6 prose prose-stone max-w-none">
        {children}
      </div>
    </div>
  );
}

export function About() {
  return (
    <PageShell title="ABOUT US">
      <p>
        Al-Hussaini Garments is a Pakistan-based kids' clothing brand,
        offering comfortable, good-quality garments for everyday wear and
        special occasions. We work directly with our stitching partners to
        keep quality high and prices fair for families across the country.
      </p>
      <p>
        Every piece we sell is checked for stitching quality, fabric, and
        sizing accuracy before it reaches your doorstep. We stand behind
        what we sell — if something isn't right, our Return &amp; Exchange
        Policy has you covered.
      </p>
      <h3>Why shop with us</h3>
      <ul>
        <li>Carefully selected fabrics and stitching</li>
        <li>Nationwide delivery with Cash on Delivery available</li>
        <li>Easy exchanges on eligible orders</li>
        <li>Real customer support — WhatsApp, phone, or our support desk</li>
      </ul>
    </PageShell>
  );
}

export function ContactUs() {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      setStatus({ type: "", msg: "" });
      const r = await api.post("/customer/contact", f);
      setStatus({ type: "success", msg: r.data?.message || "Message sent successfully." });
      setF({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.message || "Unable to send your message right now." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="CONTACT US" subtitle="We usually reply within a few hours.">
      <ul>
        <li><b>WhatsApp:</b> Use the WhatsApp button in the corner of any page</li>
        <li><b>Email:</b> support@alhussainigarments.com</li>
        <li><b>Customer Support Desk:</b> Log in and open a ticket from the Support page</li>
      </ul>
      <p>
        For order-specific questions, please have your Order ID ready — you
        can find it on your <a href="/my-orders">My Orders</a> page or via{" "}
        <a href="/track">Track Order</a>.
      </p>

      <h3>Send us a message</h3>
      <form onSubmit={submit} className="not-prose grid gap-3 max-w-lg">
        <input required className="field" placeholder="Your Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <div className="grid sm:grid-cols-2 gap-3">
          <input required type="email" className="field" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input className="field" placeholder="Phone (optional)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </div>
        <input className="field" placeholder="Subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
        <textarea required className="field min-h-32" placeholder="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
        {status.msg && <p className={status.type === "success" ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{status.msg}</p>}
        <button disabled={busy} className="btn-brand">{busy ? "SENDING..." : "SEND MESSAGE"}</button>
      </form>
    </PageShell>
  );
}

export function FAQ() {
  const faqs = [
    ["How long does delivery take?", "Most orders are delivered within 3–7 business days depending on your city, once confirmed."],
    ["What payment methods do you accept?", "Cash on Delivery, Bank Transfer, Easypaisa, and JazzCash."],
    ["Can I cancel my order?", "Yes, as long as it hasn't been shipped yet. Go to My Orders and select Cancel Order."],
    ["Can I exchange a size?", "Yes — see our Return & Exchange Policy for eligibility and steps."],
    ["How do I track my order?", "Use the Track Order page with your Order ID or phone number."],
    ["Is Cash on Delivery available everywhere?", "COD is available in most cities we deliver to. If it isn't available for your area, our team will contact you to arrange another payment method."],
  ];
  return (
    <PageShell title="FREQUENTLY ASKED QUESTIONS">
      <div className="divide-y">
        {faqs.map(([q, a]) => (
          <div key={q} className="py-4">
            <b>{q}</b>
            <p className="text-stone-600 mt-1">{a}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function PrivacyPolicy() {
  return (
    <PageShell title="PRIVACY POLICY">
      <p>
        We collect the information you provide when creating an account or
        placing an order — your name, email, phone number, and shipping
        address — solely to process and deliver your orders and to provide
        customer support.
      </p>
      <p>
        We do not sell or rent your personal information to third parties.
        Payment details for Bank Transfer, Easypaisa, or JazzCash are used
        only to verify and confirm your payment.
      </p>
      <p>
        You may request a copy of the data we hold about you, or request
        that your account be deleted, by contacting our support team.
      </p>
    </PageShell>
  );
}

export function TermsConditions() {
  return (
    <PageShell title="TERMS & CONDITIONS">
      <p>
        By placing an order on this website, you agree to provide accurate
        shipping and contact information, and to pay for your order using
        one of the payment methods offered at checkout.
      </p>
      <p>
        Product images are for illustration; actual color may vary slightly
        due to photography and screen settings. Prices and availability are
        subject to change without prior notice.
      </p>
      <p>
        We reserve the right to cancel orders that appear fraudulent, cannot
        be verified, or cannot be fulfilled due to stock issues — in which
        case any payment already made will be refunded.
      </p>
    </PageShell>
  );
}

export function ShippingPolicy() {
  return (
    <PageShell title="SHIPPING POLICY">
      <ul>
        <li>Orders are processed within 1–2 business days of confirmation.</li>
        <li>Delivery typically takes 3–7 business days depending on your city.</li>
        <li>Shipping charges (if any) are shown at checkout before you place your order.</li>
        <li>You'll receive a tracking number once your order is shipped, visible on the Track Order page.</li>
        <li>Delivery delays due to weather, courier issues, or public holidays are outside our control, but we'll keep you updated.</li>
      </ul>
    </PageShell>
  );
}

export function ReturnPolicy() {
  return (
    <PageShell title="RETURN & EXCHANGE POLICY">
      <p>
        We want you to be happy with your order. If something isn't right,
        here's how returns and exchanges work:
      </p>
      <ul>
        <li>Exchanges (size or color) can be requested within 3 days of delivery, provided the item is unused and in its original condition/packaging.</li>
        <li>Contact our support team with your Order ID to start an exchange or return request.</li>
        <li>Items marked as final sale, or that show signs of use/washing, are not eligible for return.</li>
        <li>Refunds for eligible cancellations are processed to the original payment method or as store credit, depending on the payment method used.</li>
      </ul>
    </PageShell>
  );
}
