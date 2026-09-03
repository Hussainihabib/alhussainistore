import { useEffect, useState } from "react";
import api from "../api";

const STATUSES = ["Pending","Confirmed","Processing","Shipped","Out for Delivery","Delivered","Cancelled"];
const PAYMENT_STATUSES = ["Pending","Paid","Failed","Refunded"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true); setError("");
      const r = await api.get("/orders");
      setOrders(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const update = async (id, data) => {
    try {
      setError("");
      await api.patch(`/orders/${id}`, data);
      await load();
    } catch (e) { setError(e.response?.data?.message || "Update failed"); }
  };

  const downloadInvoice = async (id, orderId) => {
    try {
      const r = await api.get(`/orders/${id}/invoice`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([r.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `invoice-${orderId}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { alert("Unable to download invoice"); }
  };

  const OrderItems = ({ order }) => (
    <>{(order.items || []).map((i, n) => (
      <div key={`${i.variantId}-${n}`} className="mb-2 flex gap-2 items-start">
        <img src={i.image || "https://placehold.co/60x60/F8F9FA/581845?text=Item"} alt={i.name} className="w-10 h-10 object-cover rounded shrink-0"/>
        <div><b>{i.name}</b><br/><span className="text-xs">Size: {i.size || "N/A"} · Color: {i.color || "N/A"} · Qty: {i.quantity}</span></div>
      </div>
    ))}</>
  );

  const Cancellation = ({ order }) => order.cancellationReason ? (
    <><span className="text-red-600 text-sm">{order.cancellationReason}</span><br/><span className="text-xs text-stone-500">{order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString() : ""}</span></>
  ) : <span className="text-stone-400">-</span>;

  return <>
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div><h1 className="text-2xl sm:text-3xl font-serif">ORDER MANAGEMENT</h1><p className="text-sm text-stone-500 mt-1">Customer, product, size, color, cancellation and delivery details.</p></div>
      <button className="btn-brand" onClick={load}>REFRESH</button>
    </div>
    {error && <p className="text-red-600 mt-4">{error}</p>}

    {loading ? <p className="mt-6 text-stone-500">Loading orders...</p> : orders.length === 0 ? <p className="mt-6 text-stone-500">No orders found.</p> : <>

      {/* Desktop / tablet-landscape: full table */}
      <div className="card mt-6 p-3 sm:p-4 overflow-x-auto hidden lg:block">
        <table className="admin-table min-w-[1300px]">
          <thead><tr><th>Order</th><th>Customer</th><th>Contact / Address</th><th>Items</th><th>Cancellation</th><th>Total</th><th>Payment</th><th>Status</th><th>Tracking</th><th>Invoice</th></tr></thead>
          <tbody>{orders.map(o => <tr key={o._id}>
            <td><b>{o.orderId}</b><br/><span className="text-xs text-stone-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</span></td>
            <td>{o.customerName || o.customer?.name || "-"}<br/><span className="text-xs text-stone-500">{o.customer?.email || o.email || ""}</span></td>
            <td>{o.phone || "-"}<br/><span className="text-xs text-stone-500">{[o.address?.addressLine, o.address?.area, o.address?.city, o.address?.postalCode].filter(Boolean).join(", ")}</span></td>
            <td><OrderItems order={o}/></td>
            <td><Cancellation order={o}/></td>
            <td>PKR {Number(o.totalAmount || 0).toLocaleString()}</td>
            <td><span className="text-xs block mb-1">{o.paymentMethod}</span><select className="field min-w-28 text-xs" value={o.paymentStatus || "Pending"} onChange={e => update(o._id, { paymentStatus: e.target.value })}>{PAYMENT_STATUSES.map(x => <option key={x} value={x}>{x}</option>)}</select></td>
            <td><select className="field min-w-36" value={o.status || "Pending"} onChange={e => update(o._id, { status: e.target.value })}>{STATUSES.map(x => <option key={x} value={x}>{x}</option>)}</select></td>
            <td><input className="field min-w-44" value={o.trackingNo || ""} onChange={e => setOrders(rows => rows.map(x => x._id === o._id ? { ...x, trackingNo: e.target.value } : x))} onBlur={e => update(o._id, { trackingNo: e.target.value })} placeholder="Courier tracking no"/></td>
            <td><button className="text-brand underline text-sm whitespace-nowrap" onClick={() => downloadInvoice(o._id, o.orderId)}>Download</button></td>
          </tr>)}</tbody>
        </table>
      </div>

      {/* Mobile / tablet-portrait: stacked cards, same data & actions */}
      <div className="grid gap-4 mt-6 lg:hidden">
        {orders.map(o => (
          <div key={o._id} className="card p-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <b>{o.orderId}</b>
                <p className="text-xs text-stone-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</p>
              </div>
              <b className="text-brand whitespace-nowrap">PKR {Number(o.totalAmount || 0).toLocaleString()}</b>
            </div>

            <div className="mt-3 text-sm">
              <p><b>{o.customerName || o.customer?.name || "-"}</b></p>
              <p className="text-stone-500 text-xs">{o.customer?.email || o.email || ""} {o.phone ? `· ${o.phone}` : ""}</p>
              <p className="text-stone-500 text-xs mt-1">{[o.address?.addressLine, o.address?.area, o.address?.city, o.address?.postalCode].filter(Boolean).join(", ")}</p>
            </div>

            <div className="mt-3 border-t pt-3 text-sm">
              <OrderItems order={o}/>
            </div>

            {o.cancellationReason && (
              <div className="mt-3 border-t pt-3 text-sm"><Cancellation order={o}/></div>
            )}

            <div className="mt-3 border-t pt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Order Status</label>
                <select className="field w-full" value={o.status || "Pending"} onChange={e => update(o._id, { status: e.target.value })}>{STATUSES.map(x => <option key={x} value={x}>{x}</option>)}</select>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Payment ({o.paymentMethod})</label>
                <select className="field w-full" value={o.paymentStatus || "Pending"} onChange={e => update(o._id, { paymentStatus: e.target.value })}>{PAYMENT_STATUSES.map(x => <option key={x} value={x}>{x}</option>)}</select>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs text-stone-500 block mb-1">Courier Tracking No.</label>
              <input className="field w-full" value={o.trackingNo || ""} onChange={e => setOrders(rows => rows.map(x => x._id === o._id ? { ...x, trackingNo: e.target.value } : x))} onBlur={e => update(o._id, { trackingNo: e.target.value })} placeholder="Courier tracking no"/>
            </div>

            <button className="text-brand underline text-sm mt-3" onClick={() => downloadInvoice(o._id, o.orderId)}>Download Invoice</button>
          </div>
        ))}
      </div>
    </>}
  </>;
}
