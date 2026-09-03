import { useState } from "react";
import { X, Ruler } from "lucide-react";

const CHART = [
  { age: "0–6 months", height: "56–68 cm", chest: "40–44 cm", size: "NB / S" },
  { age: "6–12 months", height: "68–76 cm", chest: "44–47 cm", size: "M" },
  { age: "1–2 years", height: "76–92 cm", chest: "47–51 cm", size: "L" },
  { age: "2–3 years", height: "92–98 cm", chest: "51–53 cm", size: "2Y" },
  { age: "3–4 years", height: "98–104 cm", chest: "53–55 cm", size: "3-4Y" },
  { age: "4–5 years", height: "104–110 cm", chest: "55–57 cm", size: "4-5Y" },
  { age: "5–6 years", height: "110–116 cm", chest: "57–59 cm", size: "5-6Y" },
  { age: "6–7 years", height: "116–122 cm", chest: "59–61 cm", size: "6-7Y" },
  { age: "7–8 years", height: "122–128 cm", chest: "61–63 cm", size: "7-8Y" },
];

// A general kids-clothing size guide. Measurements are approximate
// (industry-typical ranges) — actual fit can vary slightly by style, so
// we say so rather than presenting these as exact for every garment.
export default function SizeGuide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-brand underline flex items-center gap-1"
      >
        <Ruler size={14} /> Size Guide
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/50 grid place-items-center p-5" onClick={() => setOpen(false)}>
          <div className="card max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-stone-400 hover:text-stone-700" onClick={() => setOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
            <h2 className="font-serif text-xl mb-1">SIZE GUIDE</h2>
            <p className="text-xs text-stone-500 mb-4">Approximate — fit may vary slightly by style. When between sizes, we recommend sizing up.</p>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">Age</th>
                    <th className="py-2 pr-2">Height</th>
                    <th className="py-2 pr-2">Chest</th>
                    <th className="py-2">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {CHART.map((row) => (
                    <tr key={row.age} className="border-b last:border-0">
                      <td className="py-2 pr-2">{row.age}</td>
                      <td className="py-2 pr-2">{row.height}</td>
                      <td className="py-2 pr-2">{row.chest}</td>
                      <td className="py-2 font-semibold text-brand">{row.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
