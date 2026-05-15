"use client";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../store/cart";

interface Props { open: boolean; onClose: () => void; }

export default function CartDrawer({ open, onClose }: Props) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => { onClose(); router.push("/checkout"); };

  return (
    <>
      {open && <div className="pc-backdrop" onClick={onClose} />}
      <div className="pc-drawer" style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}>
        <div className="pc-drawer-header">
          <span className="pc-drawer-title">Cart {items.length > 0 && `(${items.length})`}</span>
          <button className="pc-drawer-close" onClick={onClose} aria-label="Close cart"><X size={15} /></button>
        </div>

        <div className="pc-drawer-body">
          {items.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:12, paddingTop:80, color:"var(--text-3)" }}>
              <ShoppingBag size={36} strokeWidth={1.2} />
              <p style={{ fontSize:14 }}>Your cart is empty</p>
              <button className="pc-btn pc-btn-ghost" onClick={onClose} style={{ fontSize:13 }}>Continue shopping</button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {items.map((item, i) => (
                <div key={item.product.id} style={{
                  display:"flex", gap:12, padding:"14px 0",
                  borderBottom: i < items.length - 1 ? "0.5px solid var(--border)" : "none",
                  alignItems:"flex-start"
                }}>
                  <div style={{ width:56, height:56, background:"var(--bg-2)", borderRadius:"var(--radius)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:22, color:"var(--text-3)" }}>
                    📦
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:500, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.product.name}</p>
                    <p style={{ fontSize:12, color:"var(--text-3)", marginTop:2 }}>{item.product.category}</p>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ width:24, height:24, borderRadius:4, border:"0.5px solid var(--border-2)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-2)" }}><Minus size={11} /></button>
                      <span style={{ fontSize:13, fontWeight:500, minWidth:16, textAlign:"center" }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width:24, height:24, borderRadius:4, border:"0.5px solid var(--border-2)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-2)" }}><Plus size={11} /></button>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>${(item.product.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.product.id)} style={{ color:"var(--text-3)", padding:2 }} aria-label="Remove"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="pc-drawer-footer">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontSize:13, color:"var(--text-2)" }}>Total</span>
              <span style={{ fontSize:20, fontWeight:600 }}>${total()}</span>
            </div>
            <button onClick={handleCheckout} className="pc-btn pc-btn-primary pc-btn-full" style={{ marginBottom:8 }}>Checkout</button>
            <button onClick={clearCart} style={{ width:"100%", textAlign:"center", fontSize:12, color:"var(--text-3)", padding:"6px 0" }}>Clear cart</button>
          </div>
        )}
      </div>
    </>
  );
}
