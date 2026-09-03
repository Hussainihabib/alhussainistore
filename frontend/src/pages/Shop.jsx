import {useEffect,useMemo,useState} from "react";
import {useSearchParams} from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import { usePageMeta } from "../hooks/usePageMeta";
export default function Shop(){
 usePageMeta("Shop All Products", "Browse our full range of kids clothing — filter by size, color, category and price.");
 const [sp,setSp]=useSearchParams(); const [data,setData]=useState({products:[]}); const [cats,setCats]=useState([]);
 const [loading,setLoading]=useState(false); const [err,setErr]=useState("");
 const load=async()=>{try{setLoading(true);setErr("");const r=await api.get("/products?"+sp.toString());setData(r.data)}catch(e){setErr(e.response?.data?.message||"Failed to load products")}finally{setLoading(false)}};
 useEffect(()=>{load()},[sp.toString()]); useEffect(()=>{api.get("/categories").then(r=>setCats(r.data)).catch(()=>{})},[]);
 const set=(k,v)=>{const n=new URLSearchParams(sp); if(v!==""&&v!==false)n.set(k,v);else n.delete(k);setSp(n)};
 const sizes=useMemo(()=>[...new Set((data.products||[]).flatMap(p=>(p.variants||[]).map(v=>v.size)).filter(Boolean))],[data.products]);
 const colors=useMemo(()=>[...new Set((data.products||[]).flatMap(p=>(p.variants||[]).map(v=>v.color)).filter(Boolean))],[data.products]);
 const heading = sp.get("featured")==="true" ? "FEATURED PRODUCTS"
   : sp.get("bestSeller")==="true" ? "BEST SELLERS"
   : sp.get("sort")==="newest" && !sp.get("search") && !sp.get("category") ? "NEW ARRIVALS"
   : "SHOP COLLECTION";
 return <div className="container py-8 sm:py-10"><h1 className="text-2xl sm:text-3xl font-serif">{heading}</h1>
 <div className="card p-4 mt-6 grid sm:grid-cols-2 md:grid-cols-4 gap-3">
 <input className="field" value={sp.get("search")||""} onChange={e=>set("search",e.target.value)} placeholder="Search products"/>
 <select className="field" value={sp.get("category")||""} onChange={e=>set("category",e.target.value)}><option value="">All Categories</option>{cats.map(c=><option value={c._id} key={c._id}>{c.name}</option>)}</select>
 <input className="field" type="number" placeholder="Min price" value={sp.get("minPrice")||""} onChange={e=>set("minPrice",e.target.value)}/>
 <input className="field" type="number" placeholder="Max price" value={sp.get("maxPrice")||""} onChange={e=>set("maxPrice",e.target.value)}/>
 <select className="field" value={sp.get("size")||""} onChange={e=>set("size",e.target.value)}><option value="">All Sizes</option>{sizes.map(x=><option key={x}>{x}</option>)}</select>
 <select className="field" value={sp.get("color")||""} onChange={e=>set("color",e.target.value)}><option value="">All Colors</option>{colors.map(x=><option key={x}>{x}</option>)}</select>
 <select className="field" value={sp.get("sort")||"newest"} onChange={e=>set("sort",e.target.value)}><option value="newest">Newest</option><option value="price-asc">Price Low to High</option><option value="price-desc">Price High to Low</option><option value="rating">Top Rated</option><option value="sold">Best Selling</option></select>
 <label className="field flex items-center gap-2"><input type="checkbox" checked={sp.get("inStock")==="true"} onChange={e=>set("inStock",e.target.checked?"true":"")}/> In Stock Only</label>
 <button type="button" onClick={()=>setSp(new URLSearchParams())} className="btn border border-brand text-brand">Clear Filters</button></div>
 {err&&<p className="text-red-600 mt-5">{err}</p>}{loading?<p className="mt-8">Loading products...</p>:!data.products?.length?<div className="card p-8 mt-8">No products found for these filters.</div>:<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-8">{data.products.map(p=><ProductCard key={p._id} p={p}/>)}</div>}</div>
}
