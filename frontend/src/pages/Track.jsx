import {useState} from "react";import {useSearchParams} from "react-router-dom";import api from "../api";
const steps=["Pending","Confirmed","Processing","Shipped","Out for Delivery","Delivered"];
export default function Track(){
  const [sp]=useSearchParams();
  const [q,setQ]=useState(sp.get("order")||""),[orders,setOrders]=useState([]),[err,setErr]=useState("");
  const search=async e=>{e.preventDefault();setErr("");try{setOrders((await api.get(`/orders/track/${encodeURIComponent(q)}`)).data)}catch(e){setOrders([]);setErr(e.response?.data?.message||"Not found")}};
  return <div className="container py-12 max-w-4xl">
    <h1 className="text-3xl font-serif text-center">TRACK YOUR ORDER</h1>
    <form onSubmit={search} className="card p-4 mt-6 flex gap-3">
      <input className="field" value={q} onChange={e=>setQ(e.target.value)} placeholder="Enter Order ID or Phone Number"/>
      <button className="btn-brand whitespace-nowrap">TRACK ORDER</button>
    </form>
    {err&&<p className="text-red-600 text-center mt-4">{err}</p>}
    {orders.map(o=>{
      const cancelled = o.status==="Cancelled";
      const active = steps.indexOf(o.status);
      return <div className="card p-6 mt-6" key={o._id}>
        <div className="flex justify-between flex-wrap gap-3">
          <div><b>{o.orderId}</b><p className="text-sm text-stone-500">PKR {o.totalAmount.toLocaleString()}</p></div>
          <b className={cancelled?"text-red-600":"text-brand"}>{o.status}</b>
        </div>
        {cancelled ? (
          <div className="mt-6 p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-600">
            <b>Order cancelled.</b> {o.cancellationReason && <>Reason: {o.cancellationReason}</>}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-4 mt-8">
            {steps.map((s,i)=><div key={s} className="text-center text-xs">
              <div className={`w-8 h-8 mx-auto rounded-full grid place-items-center ${i<=active?"bg-brand text-white":"bg-stone-200"}`}>✓</div>
              <p className="mt-2">{s}</p>
            </div>)}
          </div>
        )}
        <div className="mt-6 border-t pt-4 text-sm">
          <b>Courier Tracking:</b> {o.trackingNo||"Will be updated"}
          <p className="mt-2 text-stone-600">{o.courierNotes}</p>
        </div>
      </div>
    })}
  </div>
}
