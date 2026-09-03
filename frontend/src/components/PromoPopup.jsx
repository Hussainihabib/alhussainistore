import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../api";

const SESSION_KEY = "ahg_promo_shown";

// Shows at most once per browser session. Content is configurable via the
// admin "promo" setting; if disabled or not configured, nothing renders.
export default function PromoPopup() {
  const [promo, setPromo] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    api.get("/admin-public/settings")
      .then((r) => {
        const p = r.data?.promo;
        if (p?.enabled) {
          setPromo(p);
          setVisible(true);
          sessionStorage.setItem(SESSION_KEY, "1");
        }
      })
      .catch(() => {});
  }, []);

  if (!visible || !promo) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 grid place-items-center p-5" onClick={() => setVisible(false)}>
      <div
        className="card relative max-w-sm w-full p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-700"
          onClick={() => setVisible(false)}
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-serif text-brand">{promo.title || "Special Offer"}</h2>
        <p className="text-stone-600 mt-3">{promo.message || "Subscribe to receive special offers."}</p>
        {promo.code && (
          <div className="mt-4 inline-block border-2 border-dashed border-gold px-4 py-2 rounded-lg font-bold text-brand">
            {promo.code}
          </div>
        )}
        <button className="btn-brand w-full mt-6" onClick={() => setVisible(false)}>SHOP NOW</button>
      </div>
    </div>
  );
}
