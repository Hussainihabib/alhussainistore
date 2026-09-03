import { Link, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  const [sp] = useSearchParams();
  const order = sp.get("order");
  return (
    <div className="container py-20 text-center max-w-lg">
      <XCircle size={56} className="mx-auto text-red-600" />
      <h1 className="text-3xl font-serif mt-4">Payment Not Completed</h1>
      <p className="text-stone-500 mt-3">
        {order
          ? <>Your order <b>{order}</b> has been placed, but payment wasn't completed. You can retry payment or choose Cash on Delivery from your order details.</>
          : "Your payment wasn't completed."}
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {order && <Link to={`/track?order=${order}`} className="btn-brand">VIEW ORDER</Link>}
        <Link to="/shop" className="btn border">CONTINUE SHOPPING</Link>
      </div>
    </div>
  );
}
