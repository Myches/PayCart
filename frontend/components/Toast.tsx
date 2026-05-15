"use client";
import { useEffect, useState } from "react";

interface ToastItem { id: number; message: string; type: "success"|"error"|"info"; }

let addToast: (msg: string, type?: ToastItem["type"]) => void = () => {};
export const toast = {
  success: (msg: string) => addToast(msg, "success"),
  error: (msg: string) => addToast(msg, "error"),
  info: (msg: string) => addToast(msg, "info"),
};

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => {
    addToast = (message, type = "info") => {
      const id = Date.now();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
    };
  }, []);

  const bgMap = { success: "#065F46", error: "#991B1B", info: "var(--text)" };

  return (
    <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none" }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          padding: "11px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
          background: bgMap[t.type], color: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          animation: "slideIn 0.2s ease",
          maxWidth: "320px",
        }}>
          {t.message}
        </div>
      ))}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}
