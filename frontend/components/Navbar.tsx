"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../store/cart";

interface NavbarProps { onCartClick?: () => void; }

export default function Navbar({ onCartClick }: NavbarProps) {
  const pathname = usePathname();
  const { itemCount, total } = useCartStore();
  const count = itemCount();
  const amount = total();

  return (
    <nav className="pc-nav">
      <Link href="/">
        <span className="pc-nav-logo">Pay<span>Cart</span></span>
      </Link>
      <div className="pc-nav-links">
        <Link href="/" className={`pc-nav-link${pathname === "/" ? " active" : ""}`}>Shop</Link>
        <Link href="/orders" className={`pc-nav-link${pathname === "/orders" ? " active" : ""}`}>Orders</Link>
        <Link href="/login" className={`pc-nav-link${pathname === "/login" ? " active" : ""}`}>Login</Link>
        {onCartClick && (
          <button onClick={onCartClick} className="pc-nav-cart" aria-label="Open cart">
            {count > 0
              ? <><span className="pc-nav-cart-badge">{count}</span>Cart · ${amount}</>
              : <><ShoppingBag size={14} />Cart</>
            }
          </button>
        )}
      </div>
    </nav>
  );
}
