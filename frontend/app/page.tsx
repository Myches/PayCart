"use client";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { apiClient } from "../lib/api";
import type { Product } from "../types";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";

const CATEGORIES = ["All", "Electronics", "Accessories", "Footwear", "Kitchen", "Home", "Clothing"];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [sort, setSort] = useState<"default"|"price-asc"|"price-desc">("default");

  useEffect(() => {
    apiClient.get<Product[]>("/products")
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  let filtered = products
    .filter(p => category === "All" || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <div className="pc-page" style={{ background:"var(--bg)" }}>
      <Navbar onCartClick={() => setCartOpen(true)} />

      {/* Hero */}
      <section style={{ padding:"64px 32px 48px", maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
        <div>
          <p style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--brand)", fontWeight:500, marginBottom:14 }}>Free delivery over $50</p>
          <h1 style={{ fontSize:"clamp(36px,5vw,56px)", fontWeight:600, lineHeight:1.05, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:16 }}>
            Shop without<br />limits.
          </h1>
          <p style={{ fontSize:16, color:"var(--text-2)", lineHeight:1.7, marginBottom:28, maxWidth:380 }}>
            Discover products from local businesses. Curated quality, delivered fast.
          </p>
          <div style={{ display:"flex", gap:10 }}>
            <button className="pc-btn pc-btn-primary" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior:'smooth' })}>Shop now</button>
            <button className="pc-btn pc-btn-ghost">Our story</button>
          </div>
        </div>
        <div style={{ background:"var(--bg-2)", borderRadius:"var(--radius-xl)", height:280, display:"flex", alignItems:"center", justifyContent:"center", border:"0.5px solid var(--border)" }}>
          <span style={{ fontSize:72 }}>🛍️</span>
        </div>
      </section>

      {/* Search + filter bar */}
      <section style={{ borderTop:"0.5px solid var(--border)", borderBottom:"0.5px solid var(--border)", background:"#fff", position:"sticky", top:"var(--nav-h)", zIndex:10 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"12px 32px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ position:"relative", flex:1, maxWidth:360 }}>
            <Search size={14} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)", pointerEvents:"none" }} />
            <input className="pc-input" style={{ paddingLeft:34, height:36 }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display:"flex", gap:6, flex:1, overflowX:"auto" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:500, whiteSpace:"nowrap", cursor:"pointer",
                background: category === cat ? "var(--text)" : "transparent",
                color: category === cat ? "var(--bg)" : "var(--text-2)",
                border: category === cat ? "0.5px solid var(--text)" : "0.5px solid var(--border)",
                transition:"all 0.15s"
              }}>{cat}</button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
            <SlidersHorizontal size={13} style={{ color:"var(--text-3)" }} />
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} style={{ border:"0.5px solid var(--border)", background:"transparent", fontSize:12, color:"var(--text-2)", padding:"4px 8px", borderRadius:4, outline:"none" }}>
              <option value="default">Relevance</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="pc-container pc-section">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <h2 style={{ fontSize:18, fontWeight:500 }}>
            {category === "All" ? "All products" : category}
            {!loading && <span style={{ fontSize:14, fontWeight:400, color:"var(--text-3)", marginLeft:8 }}>{filtered.length} items</span>}
          </h2>
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"80px 0", gap:10, color:"var(--text-3)" }}>
            <Loader2 size={18} style={{ animation:"spin 1s linear infinite" }} />
            <span style={{ fontSize:14 }}>Loading products...</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0", color:"var(--text-3)" }}>
            <p style={{ fontSize:15, marginBottom:8 }}>No products found</p>
            <p style={{ fontSize:13 }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))", gap:20 }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop:"0.5px solid var(--border)", padding:"32px", textAlign:"center" }}>
        <p style={{ fontSize:12, color:"var(--text-3)" }}>© 2026 PayCart. Built on AWS.</p>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
