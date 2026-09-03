import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErr("");
      setMsg("");
      const r = await api.post("/auth/forgot-password", { email });
      setMsg(r.data?.message || "If an account exists for that email, a reset link has been sent.");
    } catch (e) {
      setErr(e.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16 max-w-md">
      <h1 className="text-3xl font-serif text-center">FORGOT PASSWORD</h1>
      <p className="text-stone-500 text-center mt-2">
        Enter your account email and we'll send you a reset link.
      </p>
      <form onSubmit={submit} className="card p-6 mt-6 grid gap-4">
        <input
          className="field"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        {msg && <p className="text-green-600 text-sm">{msg}</p>}
        <button disabled={loading} className="btn-brand">
          {loading ? "SENDING..." : "SEND RESET LINK"}
        </button>
        <Link to="/login" className="text-sm text-center text-brand underline">Back to login</Link>
      </form>
    </div>
  );
}
