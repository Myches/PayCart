"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../lib/api";
import type { AuthResponse } from "../../types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwChecks = [
    { label: "At least 8 characters", ok: form.password.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(form.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await apiClient.post<AuthResponse>("/auth/register", form);
      localStorage.setItem("paycart_token", res.data.token);
      localStorage.setItem("paycart_user", JSON.stringify(res.data.user));
      toast.success(`Welcome to PayCart, ${res.data.user.name.split(" ")[0]}!`);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
            Join thousands of shoppers.
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", lineHeight:1.7, maxWidth:320 }}>
            Create your account in seconds and start discovering local products.
          </p>
          <div style={{ marginTop:32, display:"flex", flexDirection:"column", gap:10 }}>
            {["Free delivery on orders over $50", "Track your orders in real time", "Secure checkout, always"].map(f => (
              <div key={f} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:"rgba(193,123,62,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Check size={10} style={{ color:"var(--brand)" }} />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>© 2026 PayCart</p>
        <div style={{ position:"absolute", right:-60, top:-60, width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />
      </div>

      {/* Right panel */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48, background:"#fff" }}>
        <div style={{ width:"100%", maxWidth:360 }}>
          <h1 style={{ fontSize:24, fontWeight:600, color:"var(--text)", letterSpacing:"-0.5px", marginBottom:6 }}>Create account</h1>
          <p style={{ fontSize:14, color:"var(--text-2)", marginBottom:32 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color:"var(--text)", fontWeight:500, textDecoration:"underline", textUnderlineOffset:3 }}>Sign in</Link>
          </p>

          {error && (
            <div style={{ background:"var(--danger-bg)", border:"0.5px solid rgba(153,27,27,0.2)", borderRadius:"var(--radius-sm)", padding:"10px 14px", fontSize:13, color:"var(--danger)", marginBottom:20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label className="pc-label">Full name</label>
              <input className="pc-input" type="text" placeholder="Jane Smith" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="pc-label">Email address</label>
              <input className="pc-input" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="pc-label">Password</label>
              <div style={{ position:"relative" }}>
                <input className="pc-input" type={showPw ? "text" : "password"} placeholder="Min. 8 characters" required minLength={8} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingRight:40 }} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)", display:"flex" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div style={{ display:"flex", gap:12, marginTop:8 }}>
                  {pwChecks.map(c => (
                    <div key={c.label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color: c.ok ? "var(--success)" : "var(--text-3)" }}>
                      <Check size={10} style={{ opacity: c.ok ? 1 : 0.3 }} />{c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="pc-btn pc-btn-primary pc-btn-full" style={{ height:42, marginTop:4 }}>
              {loading ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> Creating account...</> : "Create account"}
            </button>
          </form>

          <p style={{ fontSize:12, color:"var(--text-3)", marginTop:20, textAlign:"center", lineHeight:1.6 }}>
            By creating an account you agree to our{" "}
            <span style={{ color:"var(--text-2)", textDecoration:"underline", textUnderlineOffset:2 }}>Terms of Service</span>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
