"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, Loader2, Trash2, Minus, Plus, Package } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../lib/api";
import { useCartStore } from "../../store/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("paycart_token");
    setIsLoggedIn(!!token);
  }, []);

  const subtotal = total();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const orderTotal = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (items.length === 0) return;
    setLoading(true);
    try {
      await apiClient.post("/orders", {
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
      });
      clearCart();
      toast.success("Order placed successfully!");
      router.push("/orders");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, background:"var(--bg)" }}>
        <Package size={48} strokeWidth={1.2} style={{ color:"var(--text-3)" }} />
        <h2 style={{ fontSize:20, fontWeight:600 }}>Your cart is empty</h2>
        <p style={{ fontSize:14, color:"var(--text-2)" }}>Add some products before checking out</p>
        <Link href="/" className="pc-btn pc-btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {/* Minimal checkout nav */}
      <nav style={{ height:"var(--nav-h)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", borderBottom:"0.5px solid var(--border)", background:"#fff" }}>
        <Link href="/" style={{ fontSize:17, fontWeight:600, letterSpacing:"-0.5px" }}>Pay<span style={{ color:"var(--brand)" }}>Cart</span></Link>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"var(--text-3)" }}>
          <Lock size={12} />Secure checkout
        </div>
      </nav>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"40px 32px", display:"grid", gridTemplateColumns:"1fr 380px", gap:40, alignItems:"start" }}>
        {/* Left — cart items */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <Link href="/" style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"var(--text-3)", transition:"color 0.15s" }}>
              <ArrowLeft size={14} />Back to shop
            </Link>
          </div>

          <h1 style={{ fontSize:22, fontWeight:600, letterSpacing:"-0.5px", marginBottom:24 }}>
            Your cart <span style={{ fontSize:15, fontWeight:400, color:"var(--text-3)" }}>({items.length} {items.length === 1 ? "item" : "items"})</span>
          </h1>

          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {items.map((item, i) => (
              <div key={item.product.id} style={{
                display:"flex", gap:16, padding:"18px 0", alignItems:"flex-start",
                borderBottom: i < items.length - 1 ? "0.5px solid var(--border)" : "none"
              }}>
                <div style={{ width:72, height:72, background:"var(--bg-2)", borderRadius:"var(--radius)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:"0.5px solid var(--border)" }}>
                  {item.product.imageUrl
                    ? <img src={item.product.imageUrl} alt={item.product.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"var(--radius)" }} />
                    : <Package size={24} strokeWidth={1.2} style={{ color:"var(--text-3)" }} />
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:500, color:"var(--text)", marginBottom:2 }}>{item.product.name}</p>
                  <p style={{ fontSize:12, color:"var(--text-3)", marginBottom:12 }}>{item.product.category}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ width:28, height:28, borderRadius:"var(--radius-sm)", border:"0.5px solid var(--border-2)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-2)", background:"#fff" }}><Minus size={12} /></button>
                    <span style={{ fontSize:14, fontWeight:500, minWidth:20, textAlign:"center" }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width:28, height:28, borderRadius:"var(--radius-sm)", border:"0.5px solid var(--border-2)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-2)", background:"#fff" }}><Plus size={12} /></button>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:12 }}>
                  <span style={{ fontSize:16, fontWeight:600 }}>${(item.product.price * item.quantity)}</span>
                  <button onClick={() => removeItem(item.product.id)} style={{ color:"var(--text-3)", display:"flex", alignItems:"center", gap:4, fontSize:12 }} aria-label="Remove item">
                    <Trash2 size={13} />Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — order summary */}
        <div style={{ background:"#fff", border:"0.5px solid var(--border)", borderRadius:"var(--radius-lg)", padding:24, position:"sticky", top:"calc(var(--nav-h) + 24px)" }}>
          <h2 style={{ fontSize:16, fontWeight:600, marginBottom:20 }}>Order summary</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {[
              { label:"Subtotal", value:`$${subtotal}` },
              { label:"Shipping", value: shipping === 0 ? "Free" : `$${shipping}`, green: shipping === 0 },
              { label:"Tax (8%)", value:`$${tax}` },
            ].map(row => (
              <div key={row.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"0.5px solid var(--border)", fontSize:14 }}>
                <span style={{ color:"var(--text-2)" }}>{row.label}</span>
                <span style={{ color: row.green ? "var(--success)" : "var(--text)", fontWeight: row.green ? 500 : 400 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"16px 0", fontSize:17, fontWeight:600 }}>
              <span>Total</span>
              <span>${orderTotal}</span>
            </div>
          </div>

          {shipping > 0 && (
            <div style={{ background:"var(--brand-light)", borderRadius:"var(--radius-sm)", padding:"8px 12px", fontSize:12, color:"var(--brand-dark)", marginBottom:16 }}>
              Add ${(50 - subtotal)} more for free shipping
            </div>
          )}

          {!isLoggedIn && (
            <div style={{ background:"var(--bg-2)", borderRadius:"var(--radius-sm)", padding:"10px 12px", fontSize:12, color:"var(--text-2)", marginBottom:16, lineHeight:1.5 }}>
              You need to <Link href="/login" style={{ color:"var(--text)", fontWeight:500, textDecoration:"underline", textUnderlineOffset:2 }}>sign in</Link> to place an order.
            </div>
          )}

          <button onClick={handlePlaceOrder} disabled={loading} className="pc-btn pc-btn-primary pc-btn-full" style={{ height:44, marginBottom:12 }}>
            {loading ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> Placing order...</> : isLoggedIn ? "Place order" : "Sign in to checkout"}
          </button>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:12, color:"var(--text-3)" }}>
            <Lock size={11} />256-bit SSL encryption
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
