"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../lib/api";
import type { AuthResponse } from "../../types";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await apiClient.post<AuthResponse>("/auth/login", form);
      localStorage.setItem("paycart_token", res.data.token);
      localStorage.setItem("paycart_user", JSON.stringify(res.data.user));
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}`);
      router.push(res.data.user.role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr" }}>
      {/* Left panel */}
      <div style={{ background:"var(--text)", padding:48, display:"flex", flexDirection:"column", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
        <Link href="/" style={{ fontSize:17, fontWeight:600, color:"#fff", letterSpacing:"-0.5px" }}>
          Pay<span style={{ color:"var(--brand)" }}>Cart</span>
        </Link>
        <div>
          <h2 style={{ fontSize:"clamp(28px,3vw,40px)", fontWeight:600, color:"#fff", letterSpacing:"-1px", lineHeight:1.15, marginBottom:16 }}>
            Welcome back.
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", lineHeight:1.7, maxWidth:320 }}>
            Thousands of products from local businesses, delivered to your door.
          </p>
        </div>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>© 2026 PayCart</p>
        {/* Decorative circles */}
        <div style={{ position:"absolute", right:-60, top:-60, width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", right:-20, bottom:80, width:180, height:180, borderRadius:"50%", background:"rgba(193,123,62,0.12)", pointerEvents:"none" }} />
      </div>

      {/* Right panel */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48, background:"#fff" }}>
        <div style={{ width:"100%", maxWidth:360 }}>
          <h1 style={{ fontSize:24, fontWeight:600, color:"var(--text)", letterSpacing:"-0.5px", marginBottom:6 }}>Sign in</h1>
          <p style={{ fontSize:14, color:"var(--text-2)", marginBottom:32 }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color:"var(--text)", fontWeight:500, textDecoration:"underline", textUnderlineOffset:3 }}>Create one</Link>
          </p>

          {error && (
            <div style={{ background:"var(--danger-bg)", border:"0.5px solid rgba(153,27,27,0.2)", borderRadius:"var(--radius-sm)", padding:"10px 14px", fontSize:13, color:"var(--danger)", marginBottom:20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label className="pc-label">Email address</label>
              <input className="pc-input" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <label className="pc-label" style={{ margin:0 }}>Password</label>
                <button type="button" style={{ fontSize:12, color:"var(--text-3)" }}>Forgot password?</button>
              </div>
              <div style={{ position:"relative" }}>
                <input className="pc-input" type={showPw ? "text" : "password"} placeholder="••••••••" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingRight:40 }} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)", display:"flex" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="pc-btn pc-btn-primary pc-btn-full" style={{ height:42, marginTop:4 }}>
              {loading ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> Signing in...</> : "Sign in"}
            </button>
          </form>

          <div className="pc-divider" style={{ margin:"24px 0" }}>or continue with</div>
          <Link href="/" className="pc-btn pc-btn-ghost pc-btn-full" style={{ justifyContent:"center" }}>Browse without signing in</Link>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
