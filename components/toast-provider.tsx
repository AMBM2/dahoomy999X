"use client"

import { Toaster } from "react-hot-toast"

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(6, 182, 212, 0.5)",
          borderRadius: "12px",
          backdropFilter: "blur(10px)",
          color: "#fff",
          padding: "16px",
          fontSize: "14px",
          fontFamily: "var(--font-cairo), sans-serif",
          boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)",
        },
        success: {
          icon: "✨",
          style: {
            borderColor: "rgba(34, 197, 94, 0.5)",
            boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)",
          },
        },
        error: {
          icon: "⚠️",
          style: {
            borderColor: "rgba(239, 68, 68, 0.5)",
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
          },
        },
      }}
    />
  )
}
