import {Link} from "react-router-dom";
import {useStore} from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
export default function Wishlist(){
 const {wishlist}=useStore();
 return <div className="container py-10"><h1 className="text-3xl font-serif">MY WISHLIST</h1>
 {!wishlist.length?<div className="card p-8 mt-6">Your wishlist is empty. <Link className="text-brand underline" to="/shop">Continue shopping</Link></div>:<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">{wishlist.map(p=><ProductCard key={p._id} p={p}/>)}</div>}</div>
}
