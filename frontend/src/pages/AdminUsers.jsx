import {useEffect,useState} from "react";
import api from "../api";

export default function AdminUsers(){
  const [rows,setRows]=useState([]),[err,setErr]=useState("");
  const [loading,setLoading]=useState(true);
  const load=async()=>{try{setLoading(true);const r=await api.get("/admin/users");setRows(Array.isArray(r.data)?r.data:[])}catch(e){setErr(e.response?.data?.message||"Failed to load users")}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);
  const toggle=async id=>{try{await api.patch(`/admin/users/${id}/toggle`);load()}catch(e){alert(e.response?.data?.message||"Unable to update user")}};

  return <>
    <h1 className="text-2xl sm:text-3xl font-serif">CUSTOMERS</h1>
    {err&&<p className="text-red-600 mt-4">{err}</p>}
    {loading ? <p className="mt-6 text-stone-500">Loading customers...</p> : rows.length===0 ? <p className="mt-6 text-stone-500">No customers found.</p> : <>

      {/* Desktop / tablet-landscape: full table */}
      <div className="card p-4 mt-6 overflow-auto hidden lg:block">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Total Orders</th><th>Total Spent</th><th>Last Order</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{rows.map(u=><tr key={u._id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.phone||"—"}</td>
            <td>{u.createdAt?new Date(u.createdAt).toLocaleDateString():"—"}</td>
            <td>{u.totalOrders||0}</td>
            <td>PKR {(Number(u.totalSpent)||0).toLocaleString()}</td>
            <td>{u.lastOrderDate?new Date(u.lastOrderDate).toLocaleDateString():"—"}</td>
            <td>{u.isActive?"Active":"Blocked"}</td>
            <td><button onClick={()=>toggle(u._id)} className={u.isActive?"text-red-600":"text-green-600"}>{u.isActive?"Block":"Unblock"}</button></td>
          </tr>)}</tbody>
        </table>
      </div>

      {/* Mobile / tablet-portrait: stacked cards */}
      <div className="grid gap-4 mt-6 lg:hidden">
        {rows.map(u=>(
          <div key={u._id} className="card p-4">
            <div className="flex justify-between items-start gap-2">
              <div><b>{u.name}</b><p className="text-xs text-stone-500">{u.email}</p></div>
              <span className={`text-xs font-semibold ${u.isActive?"text-green-600":"text-red-600"}`}>{u.isActive?"Active":"Blocked"}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
              <div><span className="text-stone-400 text-xs block">Phone</span>{u.phone||"—"}</div>
              <div><span className="text-stone-400 text-xs block">Registered</span>{u.createdAt?new Date(u.createdAt).toLocaleDateString():"—"}</div>
              <div><span className="text-stone-400 text-xs block">Total Orders</span>{u.totalOrders||0}</div>
              <div><span className="text-stone-400 text-xs block">Total Spent</span>PKR {(Number(u.totalSpent)||0).toLocaleString()}</div>
              <div className="col-span-2"><span className="text-stone-400 text-xs block">Last Order</span>{u.lastOrderDate?new Date(u.lastOrderDate).toLocaleDateString():"—"}</div>
            </div>
            <button onClick={()=>toggle(u._id)} className={`mt-3 text-sm font-medium ${u.isActive?"text-red-600":"text-green-600"}`}>{u.isActive?"Block Customer":"Unblock Customer"}</button>
          </div>
        ))}
      </div>
    </>}
  </>
}
