export interface Product {
  id: string; name: string; description: string;
  price: number; stock: number; imageUrl?: string;
  category: string; createdAt: string;
}
export interface CartItem { product: Product; quantity: number; }
export interface User { id: string; name: string; email: string; role: "customer" | "admin"; }
export interface AuthResponse { token: string; user: User; }
export interface Order {
  id: string; userId: string; total: number;
  status: "pending"|"processing"|"shipped"|"delivered"|"cancelled";
  createdAt: string; items: OrderItem[];
  userName?: string; userEmail?: string;
}
export interface OrderItem {
  productId: string; productName: string; quantity: number; price: number;
}
