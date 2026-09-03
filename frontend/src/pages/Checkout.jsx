import {useEffect,useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import api from "../api";
import {useStore} from "../context/StoreContext";

const ALL_PAYMENT_METHODS = [
  {value:"COD", label:"Cash on Delivery"},
  {value:"Bank Transfer", label:"Bank Transfer"},
  {value:"Easypaisa", label:"Easypaisa"},
  {value:"JazzCash", label:"JazzCash"},
  {value:"Card", label:"Debit / Credit Card"},
];

const PAYMENT_INSTRUCTIONS = {
  "Bank Transfer": "Please transfer the total amount to our bank account and share the payment screenshot with our support team. Your order will be confirmed once payment is verified.",
  "Easypaisa": "Please send the total amount to our Easypaisa account and share the transaction ID with our support team. Your order will be confirmed once payment is verified.",
};

export default function Checkout(){
  const {user,cart,setCart}=useStore();
  const nav=useNavigate();
  const [f,setF]=useState({
    customerName:user?.name||"",
    phone:user?.phone||"",
    email:user?.email||"",
    city:"",
    area:"",
    addressLine:"",
    postalCode:"",
    instructions:"",
    couponCode:"",
    paymentMethod:"COD",
  });
  const [msg,setMsg]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [gateways,setGateways]=useState({stripeEnabled:false,jazzCashEnabled:false});

  const safeCart = Array.isArray(cart) ? cart : [];
  const subtotal = safeCart.reduce((sum,item)=>sum+Number(item?.product?.sellingPrice||0)*Number(item?.quantity||1),0);

  // Live order-total preview: recalculated from the server (real shipping
  // rules + real coupon validation) whenever the city or coupon code
  // changes, so the customer sees an accurate total before placing the
  // order — not just "will be calculated later".
  const [quote,setQuote]=useState({subtotal:0,discount:0,shippingAmount:0,total:0,couponMessage:""});
  const [quoteLoading,setQuoteLoading]=useState(false);

  useEffect(()=>{
    api.get("/payments/config").then(r=>setGateways(r.data||{})).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(!safeCart.length){ setQuote({subtotal:0,discount:0,shippingAmount:0,total:0,couponMessage:""}); return; }
    const t=setTimeout(async ()=>{
      try{
        setQuoteLoading(true);
        const r=await api.post("/orders/quote",{
          items:safeCart.map(i=>({productId:i.product._id,variantId:i.variantId,quantity:i.quantity})),
          city:f.city,
          couponCode:f.couponCode,
        });
        setQuote(r.data);
      }catch(e){
        setQuote({subtotal,discount:0,shippingAmount:0,total:subtotal,couponMessage:e.response?.data?.message||""});
      }finally{
        setQuoteLoading(false);
      }
    },400);
    return ()=>clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[f.city,f.couponCode,cart.length]);

  // JazzCash still works without a live gateway — it just falls back to
  // manual payment instructions like Easypaisa/Bank Transfer do.
  const paymentMethods = ALL_PAYMENT_METHODS.filter(m => m.value!=="Card" || gateways.stripeEnabled);
  const jazzCashInstructions = gateways.jazzCashEnabled
    ? null
    : "Please send the total amount to our JazzCash account and share the transaction ID with our support team. Your order will be confirmed once payment is verified.";

  const submit=async e=>{
    e.preventDefault();
    if(!cart.length){setMsg("Your cart is empty");return;}
    try{
      setMsg("");
      setSubmitting(true);
      const r=await api.post("/orders",{
        customerName:f.customerName,
        phone:f.phone,
        email:f.email,
        address:{city:f.city,area:f.area,addressLine:f.addressLine,postalCode:f.postalCode,instructions:f.instructions},
        couponCode:f.couponCode,
        paymentMethod:f.paymentMethod,
        items:cart.map(i=>({productId:i.product._id,variantId:i.variantId,quantity:i.quantity}))
      });
      const order=r.data;
      setCart([]);

      if(f.paymentMethod==="Card" && gateways.stripeEnabled){
        const s=await api.post(`/payments/stripe/create-session/${order._id}`);
        if(s.data?.url){ window.location.href=s.data.url; return; }
      }
      if(f.paymentMethod==="JazzCash" && gateways.jazzCashEnabled){
        window.location.href=`${api.defaults.baseURL}/payments/jazzcash/initiate/${order._id}`;
        return;
      }
      nav(`/track?order=${order.orderId}`);
    }catch(e){
      setMsg(e.response?.data?.message||"Checkout failed");
    }finally{
      setSubmitting(false);
    }
  };

  return <form onSubmit={submit} className="container py-8 sm:py-10 max-w-5xl grid lg:grid-cols-[1fr_360px] gap-6 sm:gap-7">
    <div>
      <h1 className="text-2xl sm:text-3xl font-serif">CHECKOUT</h1>
      {!user && (
        <div className="mt-4 p-4 rounded-lg bg-stone-50 border text-sm text-stone-600">
          Checking out as a guest. <Link to="/login?redirect=/checkout" className="text-brand underline">Log in</Link> for faster checkout next time and to track all your orders in one place — or just continue below.
        </div>
      )}
      {msg&&<p className="text-red-600 mt-4">{msg}</p>}

      <div className="card p-4 sm:p-6 mt-6">
        <h2 className="font-serif text-lg sm:text-xl mb-4">Customer Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input className="field" required placeholder="Full Name" value={f.customerName} onChange={e=>setF({...f,customerName:e.target.value})}/>
          <input className="field" required placeholder="Phone" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
          <input className="field sm:col-span-2" required type="email" placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
        </div>
      </div>

      <div className="card p-4 sm:p-6 mt-6">
        <h2 className="font-serif text-lg sm:text-xl mb-4">Shipping Address</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input className="field" required placeholder="City" value={f.city} onChange={e=>setF({...f,city:e.target.value})}/>
          <input className="field" required placeholder="Area" value={f.area} onChange={e=>setF({...f,area:e.target.value})}/>
          <input className="field" placeholder="Postal Code (optional)" value={f.postalCode} onChange={e=>setF({...f,postalCode:e.target.value})}/>
          <textarea className="field sm:col-span-2" required placeholder="Complete Address" value={f.addressLine} onChange={e=>setF({...f,addressLine:e.target.value})}/>
          <textarea className="field sm:col-span-2" placeholder="Delivery Instructions (optional)" value={f.instructions} onChange={e=>setF({...f,instructions:e.target.value})}/>
        </div>
      </div>

      <div className="card p-4 sm:p-6 mt-6">
        <h2 className="font-serif text-lg sm:text-xl mb-4">Payment Method</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {paymentMethods.map(m=>
            <label key={m.value} className={`field flex items-center gap-3 cursor-pointer ${f.paymentMethod===m.value?"border-brand":""}`}>
              <input type="radio" name="paymentMethod" value={m.value} checked={f.paymentMethod===m.value} onChange={e=>setF({...f,paymentMethod:e.target.value})}/>
              {m.label}
            </label>
          )}
        </div>
        {f.paymentMethod==="JazzCash" && jazzCashInstructions && (
          <div className="mt-4 p-4 rounded-lg bg-stone-50 border text-sm text-stone-600">{jazzCashInstructions}</div>
        )}
        {f.paymentMethod!=="JazzCash" && PAYMENT_INSTRUCTIONS[f.paymentMethod] && (
          <div className="mt-4 p-4 rounded-lg bg-stone-50 border text-sm text-stone-600">{PAYMENT_INSTRUCTIONS[f.paymentMethod]}</div>
        )}
        {f.paymentMethod==="Card" && (
          <div className="mt-4 p-4 rounded-lg bg-stone-50 border text-sm text-stone-600">You'll be redirected to a secure payment page to complete your card payment.</div>
        )}
      </div>
    </div>

    <aside className="card p-4 sm:p-6 h-fit lg:sticky lg:top-24">
      <h2 className="font-serif text-lg sm:text-xl mb-4">Order Summary</h2>
      <div className="space-y-2 text-sm max-h-48 overflow-auto">
        {safeCart.map((item,i)=>
          <div key={i} className="flex justify-between gap-2">
            <span className="text-stone-600">{item?.product?.name} × {item?.quantity}</span>
            <b>PKR {(Number(item?.product?.sellingPrice||0)*Number(item?.quantity||1)).toLocaleString()}</b>
          </div>
        )}
      </div>

      <input className="field mt-4" placeholder="Coupon Code (optional)" value={f.couponCode} onChange={e=>setF({...f,couponCode:e.target.value})}/>
      {f.couponCode && quote.couponMessage && (
        <p className={`text-xs mt-1 ${quote.couponValid?"text-green-600":"text-red-600"}`}>{quote.couponMessage}</p>
      )}

      <div className="border-t mt-4 pt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>PKR {(quote.subtotal||subtotal).toLocaleString()}</span></div>
        {quote.discount>0 && (
          <div className="flex justify-between text-green-600"><span>Discount</span><span>- PKR {quote.discount.toLocaleString()}</span></div>
        )}
        <div className="flex justify-between">
          <span>Shipping{!f.city && <span className="text-stone-400"> (enter city)</span>}</span>
          <span>{f.city ? `PKR ${quote.shippingAmount.toLocaleString()}` : "—"}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t pt-2">
          <span>Total</span>
          <span>{quoteLoading ? "…" : `PKR ${(f.city ? quote.total : subtotal).toLocaleString()}`}</span>
        </div>
      </div>

      <button disabled={submitting} className="btn-brand w-full mt-5">{submitting?"PLACING ORDER...":"PLACE ORDER"}</button>
    </aside>
  </form>;
}
