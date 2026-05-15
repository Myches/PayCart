"use client";
import { useState } from "react";
import { Plus, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cart";
import type { Product } from "../types";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(s => s.addItem);
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    if (product.stock === 0) return;
    setAdding(true);
    addItem(product);
    toast.success(`${product.name} added`);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div style={{
      background:"#fff", border:"0.5px solid var(--border)",
      borderRadius:"var(--radius-lg)", overflow:"hidden",
      display:"flex", flexDirection:"column",
      transition:"border-color 0.15s, transform 0.15s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
    >
      <div style={{ height:180, background:"var(--bg-2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <Package size={36} strokeWidth={1.2} style={{ color:"var(--text-3)" }} />
        }
      </div>
      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:6, flex:1 }}>
        <span style={{ fontSize:10, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--text-3)", fontWeight:500 }}>{product.category}</span>
        <h3 style={{ fontSize:14, fontWeight:500, color:"var(--text)", lineHeight:1.3 }}>{product.name}</h3>
        <p style={{ fontSize:12, color:"var(--text-2)", lineHeight:1.5, flex:1, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{product.description}</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6 }}>
          <span style={{ fontSize:16, fontWeight:600, color:"var(--text)" }}>${product.price}</span>
          <button onClick={handleAdd} disabled={product.stock === 0 || adding}
            style={{
              width:32, height:32, borderRadius:"var(--radius-sm)",
              background: adding ? "var(--brand)" : "var(--text)", color:"#fff",
              display:"flex", alignItems:"center", justifyContent:"center",
              border:"none", cursor: product.stock === 0 ? "not-allowed" : "pointer",
              opacity: product.stock === 0 ? 0.4 : 1, transition:"background 0.15s"
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={15} />
          </button>
        </div>
        {product.stock === 0 && <span style={{ fontSize:11, color:"var(--danger)" }}>Out of stock</span>}
        {product.stock > 0 && product.stock <= 5 && <span style={{ fontSize:11, color:"var(--warning)" }}>Only {product.stock} left</span>}
      </div>
    </div>
  );
}
