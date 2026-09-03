import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import api from "../api";

const DEFAULT_PHONE = "923352219829";
const DEFAULT_MESSAGE = "Hello Al-Hussaini Garments, I need help regarding your products.";

// Floating WhatsApp button shown only on customer-facing pages (it's
// rendered inside the <Customer> layout wrapper in App.jsx, so it never
// appears inside the admin dashboard). The phone number is configurable
// via the admin "contact" setting; falls back to a placeholder number.
export default function WhatsAppButton() {
  const [phone, setPhone] = useState(DEFAULT_PHONE);

  useEffect(() => {
    api.get("/admin-public/settings")
      .then((r) => { if (r.data?.contact?.whatsapp) setPhone(String(r.data.contact.whatsapp).replace(/\D/g, "")); })
      .catch(() => {});
  }, []);

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 bg-[#25D366] text-white rounded-full w-14 h-14 grid place-items-center shadow-lg hover:scale-105 transition"
    >
      <MessageCircle size={28} fill="white" className="text-[#25D366]" />
    </a>
  );
}
