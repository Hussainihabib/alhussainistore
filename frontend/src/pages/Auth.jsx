import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useStore } from "../context/StoreContext";

function GoogleButton({ onCredential, disabled }) {
  const ref = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  useEffect(() => {
    if (!clientId) return;
    const init = () => {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: (r) => onCredential(r.credential) });
      window.google.accounts.id.renderButton(ref.current, { theme: "outline", size: "large", width: 360, text: "continue_with" });
    };
    if (window.google) init(); else { const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true; s.onload = init; document.body.appendChild(s); }
  }, [clientId, onCredential]);
  if (!clientId) return <p className="text-xs text-stone-500 text-center mt-4">Google login will appear after VITE_GOOGLE_CLIENT_ID is configured.</p>;
  return <div className={disabled ? "opacity-50 pointer-events-none" : ""}><div ref={ref} className="flex justify-center mt-4" /></div>;
}

export default function Auth({ mode = "login" }) {
 const [form,setForm]=useState({name:"",email:"",password:"",phone:""}),[err,setErr]=useState(""),[show,setShow]=useState(false),[loading,setLoading]=useState(false);
 const {login,register,googleLogin}=useStore(); const nav=useNavigate();
 const [sp]=useSearchParams();
 const redirectTo = (sp.get("redirect")||"").startsWith("/") ? sp.get("redirect") : "/";
 const submit=async e=>{e.preventDefault();try{setLoading(true);setErr("");const u=mode==="login"?await login(form):await register(form);if(u.role!=="customer")throw new Error("Please use the admin login page");nav(redirectTo,{replace:true});}catch(e){setErr(e.response?.data?.message||e.message||"Something went wrong")}finally{setLoading(false)}};
 const onGoogle=async credential=>{try{setLoading(true);setErr("");await googleLogin(credential);nav(redirectTo,{replace:true});}catch(e){setErr(e.response?.data?.message||"Google login failed")}finally{setLoading(false)}};
 return <div className="min-h-[70vh] grid place-items-center p-5"><form onSubmit={submit} className="card w-full max-w-md p-7"><p className="text-brand text-sm font-bold">AL-HUSSAINI GARMENTS</p><h1 className="text-3xl font-serif mt-2">{mode==="login"?"Customer Login":"Create Account"}</h1>{err&&<p className="text-red-600 mt-3">{err}</p>}{mode==="register"&&<><input required value={form.name} className="field mt-5" placeholder="Full Name" onChange={e=>setForm({...form,name:e.target.value})}/><input value={form.phone} className="field mt-4" placeholder="Phone" onChange={e=>setForm({...form,phone:e.target.value})}/></>}<input required value={form.email} className="field mt-4" type="email" placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/><div className="relative mt-4"><input required value={form.password} className="field pr-12" type={show?"text":"password"} placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-3 text-stone-500">{show?<EyeOff size={20}/>:<Eye size={20}/>}</button></div>{mode==="login"&&<div className="text-right mt-2"><Link to="/forgot-password" className="text-sm text-brand underline">Forgot password?</Link></div>}<button disabled={loading} className="btn-brand w-full mt-5">{loading?"PLEASE WAIT...":mode==="login"?"LOGIN":"REGISTER"}</button><div className="flex items-center gap-3 my-4 text-xs text-stone-400"><span className="h-px bg-stone-200 flex-1"/>OR<span className="h-px bg-stone-200 flex-1"/></div><GoogleButton onCredential={onGoogle} disabled={loading}/><p className="text-sm text-center mt-5">{mode==="login"?<><span>New customer? </span><Link className="text-brand font-bold" to={`/register${sp.get("redirect")?`?redirect=${encodeURIComponent(sp.get("redirect"))}`:""}`}>Create account</Link></>:<><span>Already registered? </span><Link className="text-brand font-bold" to={`/login${sp.get("redirect")?`?redirect=${encodeURIComponent(sp.get("redirect"))}`:""}`}>Login</Link></>}</p></form></div>;
}
