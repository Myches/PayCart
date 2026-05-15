import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "PayCart",
  description: "Shop without limits — products from local businesses, delivered fast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "pc-toast",
            style: {
              background: "#1C1C1A",
              color: "#FAFAF8",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "13px",
              fontFamily: "Inter, system-ui, sans-serif",
            },
            success: { iconTheme: { primary: "#C17B3E", secondary: "#FAFAF8" } },
          }}
        />
      </body>
    </html>
  );
}
