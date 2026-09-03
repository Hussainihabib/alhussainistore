import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useStore();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setErr("");
      await adminLogin({ email, password });
      nav("/admin", { replace: true });
    } catch (e) {
      setErr(e.response?.data?.message || "Admin login failed");
    } finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-cream grid place-items-center p-5"><form onSubmit={submit} className="card w-full max-w-md p-7">
    <p className="text-brand font-bold text-sm">AL-HUSSAINI GARMENTS</p><h1 className="text-3xl font-serif mt-2">ADMIN LOGIN</h1>
    <p className="text-sm text-stone-500 mt-2">Secure access for store administrators only.</p>
    {err && <p className="text-red-600 mt-4">{err}</p>}
    <input required value={email} onChange={e => setEmail(e.target.value)} className="field mt-5" type="email" placeholder="Admin email" />
    <div className="relative mt-4"><input required value={password} onChange={e => setPassword(e.target.value)} className="field pr-12" type={show ? "text" : "password"} placeholder="Password" />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-stone-500">{show ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
    </div>
    <button disabled={loading} className="btn-brand w-full mt-5">{loading ? "SIGNING IN..." : "LOGIN AS ADMIN"}</button>
  </form></div>;
}
