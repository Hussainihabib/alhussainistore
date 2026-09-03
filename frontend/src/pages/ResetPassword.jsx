import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useStore } from "../context/StoreContext";

export default function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();
  const { setUser } = useStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setErr("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      setErr("");
      const r = await api.post(`/auth/reset-password/${token}`, { password });
      localStorage.setItem("ahg_customer_token", r.data.token);
      setUser(r.data.user);
      nav("/", { replace: true });
    } catch (e) {
      setErr(e.response?.data?.message || "This reset link is invalid or has expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16 max-w-md">
      <h1 className="text-3xl font-serif text-center">RESET PASSWORD</h1>
      <form onSubmit={submit} className="card p-6 mt-6 grid gap-4">
        <input
          className="field"
          type="password"
          required
          minLength={6}
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="field"
          type="password"
          required
          minLength={6}
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button disabled={loading} className="btn-brand">
          {loading ? "UPDATING..." : "RESET PASSWORD"}
        </button>
      </form>
    </div>
  );
}
