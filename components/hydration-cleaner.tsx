"use client"

import { useEffect } from "react"

function removeBisSkinChecked() {
  if (typeof document === "undefined") return
  
  // Remove all bis_skin_checked attributes immediately
  document.querySelectorAll("[bis_skin_checked]").forEach((el) => {
    el.removeAttribute("bis_skin_checked")
  })
  
  // Also suppress hydration warnings for affected elements
  document.querySelectorAll("[data-bis-skin-checked]").forEach((el) => {
    el.removeAttribute("data-bis-skin-checked")
  })
}

export default function HydrationCleaner() {
  // Run synchronously on mount
  useEffect(() => {
    // Run immediately
    removeBisSkinChecked()
    
    // Also run with a small delay to catch any delayed additions
    const timeouts = [
      setTimeout(removeBisSkinChecked, 0),
      setTimeout(removeBisSkinChecked, 10),
      setTimeout(removeBisSkinChecked, 100),
    ]
    
    const obs = new MutationObserver(() => {
      removeBisSkinChecked()
    })
    
    obs.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["bis_skin_checked", "data-bis-skin-checked"],
      attributeOldValue: false,
    })
    
    return () => {
      obs.disconnect()
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [])

  return null
}
