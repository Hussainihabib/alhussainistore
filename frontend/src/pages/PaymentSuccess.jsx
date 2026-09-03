import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess() {
  const [sp] = useSearchParams();
  const order = sp.get("order");
  return (
    <div className="container py-20 text-center max-w-lg">
      <CheckCircle2 size={56} className="mx-auto text-green-600" />
      <h1 className="text-3xl font-serif mt-4">Payment Successful</h1>
      <p className="text-stone-500 mt-3">
        {order ? <>Your payment for order <b>{order}</b> has been received.</> : "Your payment has been received."}
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {order && <Link to={`/track?order=${order}`} className="btn-brand">TRACK ORDER</Link>}
        <Link to="/shop" className="btn border">CONTINUE SHOPPING</Link>
      </div>
    </div>
  );
}
