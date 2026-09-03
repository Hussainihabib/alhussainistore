import {useEffect,useState} from "react";
import {useParams} from "react-router-dom";
import api from "../api";
import {useStore} from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import SizeGuide from "../components/SizeGuide";
import { usePageMeta, useJsonLd } from "../hooks/usePageMeta";

export default function Product(){
 const {id}=useParams(); const [p,setP]=useState(null),[variant,setVariant]=useState(null),[qty,setQty]=useState(1),[img,setImg]=useState(0),[error,setError]=useState("");
 const [reviews,setReviews]=useState([]),[rating,setRating]=useState(5),[comment,setComment]=useState(""),[reviewMsg,setReviewMsg]=useState("");
 const [related,setRelated]=useState([]);
 const {addCart,wishlist,toggleWishlist,user}=useStore();
 usePageMeta(p?.seoTitle || p?.name, p?.seoDescription || p?.description?.slice(0,155));
 useJsonLd("product-schema", p ? {
   "@context": "https://schema.org",
   "@type": "Product",
   name: p.name,
   image: (p.images||[]).map(i=>i.url),
   description: p.seoDescription || p.description,
   sku: p._id,
   offers: {
     "@type": "Offer",
     priceCurrency: "PKR",
     price: p.sellingPrice,
     availability: (p.variants||[]).some(v=>v.stock>0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
     url: window.location.href
   },
   ...(p.reviewCount ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount } } : {})
 } : null);
 const load=async()=>{try{setError("");const r=await api.get(`/products/${id}`);setP(r.data);const vs=Array.isArray(r.data.variants)?r.data.variants:[];setVariant(vs.find(v=>Number(v.stock)>0)||vs[0]||null);const rr=await api.get(`/reviews/product/${r.data._id}`);setReviews(Array.isArray(rr.data)?rr.data:[]);api.get(`/products/${r.data._id}/related`).then(x=>setRelated(Array.isArray(x.data)?x.data:[])).catch(()=>setRelated([]))}catch(e){setError(e.response?.data?.message||"Failed to load product")}};
 useEffect(()=>{load()},[id]);
 if(error)return <div className="container py-20 text-red-600">{error}</div>; if(!p)return <div className="container py-20">Loading product...</div>;
 const vs=Array.isArray(p.variants)?p.variants:[]; const sizes=[...new Set(vs.map(v=>v.size).filter(Boolean))]; const colors=[...new Set(vs.filter(v=>v.size===variant?.size).map(v=>v.color).filter(Boolean))]; const images=Array.isArray(p.images)?p.images:[];
 const isWish=wishlist.some(x=>x._id===p._id); const toggleWish=()=>toggleWishlist(p);
 const submitReview=async e=>{e.preventDefault();try{setReviewMsg("");await api.post(`/reviews/product/${p._id}`,{rating,comment});setComment("");setReviewMsg("Review submitted for admin approval.")}catch(e){setReviewMsg(e.response?.data?.message||"Unable to submit review")}};
 return <div className="container py-10"><div className="grid lg:grid-cols-2 gap-10"><div><img className="card w-full aspect-[3/4] object-cover" src={images[img]?.url||"https://placehold.co/700x900?text=No+Image"} alt={p.name}/>{images.length>1&&<div className="flex gap-2 mt-3 overflow-auto">{images.map((x,i)=><button type="button" onClick={()=>setImg(i)} key={x._id||i}><img className={`w-16 h-20 object-cover rounded-lg ${i===img?"ring-2 ring-brand":""}`} src={x.url} alt=""/></button>)}</div>}</div>
 <div><p className="text-brand font-bold text-sm">{p.category?.name||""}</p><div className="flex justify-between gap-4"><h1 className="text-3xl font-serif mt-2">{p.name}</h1><button type="button" onClick={toggleWish} className="border rounded-lg px-3 h-10">{isWish?"♥ Saved":"♡ Wishlist"}</button></div><div className="text-2xl font-bold text-brand mt-4">PKR {Number(p.sellingPrice||0).toLocaleString()}</div><p className="mt-5 text-stone-600">{p.description}</p>
 {sizes.length>0&&<><div className="flex items-center justify-between mt-6"><h3 className="font-bold">Size</h3><SizeGuide/></div><div className="flex flex-wrap gap-2 mt-2">{sizes.map(s=><button type="button" key={s} onClick={()=>{setVariant(vs.find(v=>v.size===s&&Number(v.stock)>0)||vs.find(v=>v.size===s)||null);setQty(1)}} className={`border rounded-lg px-4 py-2 ${variant?.size===s?"bg-brand text-white":"bg-white"}`}>{s}</button>)}</div></>}
 {colors.length>0&&<><h3 className="mt-5 font-bold">Color</h3><div className="flex flex-wrap gap-2 mt-2">{colors.map(c=><button type="button" key={c} onClick={()=>{setVariant(vs.find(v=>v.size===variant?.size&&v.color===c)||null);setQty(1)}} className={`border rounded-lg px-4 py-2 ${variant?.color===c?"bg-brand text-white":"bg-white"}`}>{c}</button>)}</div></>}
 <p className={`mt-5 font-semibold ${Number(variant?.stock)>0?"text-green-600":"text-red-600"}`}>{Number(variant?.stock)>0?`${variant.stock} available in stock`:"Out of Stock"}</p><div className="flex gap-3 mt-6"><input type="number" min="1" max={variant?.stock||1} value={qty} onChange={e=>setQty(Math.max(1,Math.min(Number(e.target.value)||1,Number(variant?.stock)||1)))} className="field w-24"/><button disabled={!variant||Number(variant.stock)<=0} onClick={()=>addCart({product:p,variantId:variant._id,quantity:qty})} className="btn-brand flex-1">ADD TO CART</button></div></div></div>
 <section className="mt-12 grid lg:grid-cols-2 gap-6"><div className="card p-6"><h2 className="text-2xl font-serif">CUSTOMER REVIEWS</h2>{!reviews.length?<p className="mt-4 text-stone-500">No approved reviews yet.</p>:reviews.map(r=><div className="border-b py-4" key={r._id}><b>{r.customer?.name||"Customer"}</b><div className="text-gold">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div><p className="text-sm mt-1">{r.comment}</p></div>)}</div>
 <div className="card p-6"><h2 className="text-2xl font-serif">WRITE A REVIEW</h2>{user?.role==="customer"?<form onSubmit={submitReview} className="mt-4 grid gap-3"><select className="field" value={rating} onChange={e=>setRating(Number(e.target.value))}>{[5,4,3,2,1].map(n=><option value={n} key={n}>{n} Star{n>1?"s":""}</option>)}</select><textarea className="field min-h-28" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your experience"/><button className="btn-brand">SUBMIT REVIEW</button>{reviewMsg&&<p className="text-sm">{reviewMsg}</p>}</form>:<p className="mt-4 text-stone-500">Please log in as a customer to submit a review. Reviews are allowed after a delivered purchase.</p>}</div></section>
 {related.length>0&&<section className="mt-14"><h2 className="text-2xl font-serif mb-5">YOU MAY ALSO LIKE</h2><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">{related.map(rp=><ProductCard key={rp._id} p={rp}/>)}</div></section>}
 </div>
}
