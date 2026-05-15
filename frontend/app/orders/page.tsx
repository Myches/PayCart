"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import { apiClient } from "../../lib/api";
import Navbar from "../../components/Navbar";
import CartDrawer from "../../components/CartDrawer";
import type { Order } from "../../types";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: "Pending",    className: "pc-badge-pending" },
  processing: { label: "Processing", className: "pc-badge-processing" },
  shipped:    { label: "Shipped",    className: "pc-badge-shipped" },
  delivered:  { label: "Delivered",  className: "pc-badge-delivered" },
  cancelled:  { label: "Cancelled",  className: "pc-badge-cancelled" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" });
}

function shortId(id: string) {
  return `#${id.slice(0,4).toUpperCase()}...${id.slice(-4).toUpperCase()}`;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("paycart_token");
    if (!token) { router.push("/login"); return; }
    const user = JSON.parse(localStorage.getItem("paycart_user") || "{}");
    setUserName(user.name?.split(" ")[0] || "");

    apiClient.get<Order[]>("/orders")
      .then(r => setOrders(r.data))
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pc-page" style={{ background:"var(--bg)" }}>
      <Navbar onCartClick={() => setCartOpen(true)} />

      <div className="pc-container" style={{ paddingTop:40, paddingBottom:80 }}>
        {/* Header */}
        <div style={{ marginBottom:36, paddingBottom:24, borderBottom:"0.5px solid var(--border)" }}>
          <h1 style={{ fontSize:28, fontWeight:600, letterSpacing:"-0.8px", marginBottom:6 }}>
            {userName ? `${userName}'s orders` : "Your orders"}
          </h1>
          <p style={{ fontSize:14, color:"var(--text-2)" }}>
            {loading ? "Loading..." : `${orders.length} ${orders.length === 1 ? "order" : "orders"} placed`}
          </p>
        </div>

        {loading ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:10, color:"var(--text-3)" }}>
            <Loader2 size={18} style={{ animation:"spin 1s linear infinite" }} />
            <span style={{ fontSize:14 }}>Loading your orders...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <p style={{ fontSize:14, color:"var(--danger)", marginBottom:16 }}>{error}</p>
            <button className="pc-btn pc-btn-ghost" onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:16 }}>
            <ShoppingBag size={48} strokeWidth={1.2} style={{ color:"var(--text-3)" }} />
            <h2 style={{ fontSize:18, fontWeight:500 }}>No orders yet</h2>
            <p style={{ fontSize:14, color:"var(--text-2)" }}>When you place an order it will appear here</p>
            <Link href="/" className="pc-btn pc-btn-primary">Start shopping</Link>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {orders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <div key={order.id} style={{ background:"#fff", border:"0.5px solid var(--border)", borderRadius:"var(--radius-lg)", overflow:"hidden", transition:"border-color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
                >
                  {/* Order header */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"0.5px solid var(--border)", background:"var(--bg)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                      <div>
                        <p style={{ fontSize:13, fontWeight:500, color:"var(--text)", fontFamily:"var(--font-mono, monospace)" }}>{shortId(order.id)}</p>
                        <p style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`pc-badge ${status.className}`}>{status.label}</span>
                  </div>

                  {/* Order items */}
                  <div style={{ padding:"14px 20px" }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom: i < order.items.length - 1 ? "0.5px solid var(--border)" : "none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:32, height:32, background:"var(--bg-2)", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <Package size={14} style={{ color:"var(--text-3)" }} />
                          </div>
                          <span style={{ fontSize:13, color:"var(--text)" }}>{item.productName}</span>
                          <span style={{ fontSize:12, color:"var(--text-3)" }}>× {item.quantity}</span>
                        </div>
                        <span style={{ fontSize:13, fontWeight:500, color:"var(--text)" }}>${(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order footer */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderTop:"0.5px solid var(--border)", background:"var(--bg)" }}>
                    <div>
                      <p style={{ fontSize:11, color:"var(--text-3)" }}>Order total</p>
                      <p style={{ fontSize:16, fontWeight:600, color:"var(--text)" }}>${Number(order.total)}</p>
                    </div>
                    <Link href="/" style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"var(--text-2)", border:"0.5px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"7px 14px", transition:"all 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-2)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      Reorder<ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
