import { Truck, ShieldCheck, RefreshCcw, Banknote, Sparkles } from "lucide-react";

const BADGES = [
  { icon: Truck, label: "Fast Delivery" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: RefreshCcw, label: "Easy Exchange" },
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: Sparkles, label: "Quality Products" },
];

// A slim, unobtrusive trust-badge strip for customer-facing pages.
export default function TrustBadges() {
  return (
    <div className="bg-stone-50 border-y border-stone-200">
      <div className="container py-4 flex flex-wrap justify-center gap-x-8 gap-y-3">
        {BADGES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs sm:text-sm text-stone-600">
            <Icon size={18} className="text-brand" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
