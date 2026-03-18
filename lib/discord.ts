export async function notifyThemeSelected(theme: string): Promise<void> {
  try {
    await fetch("/api/discord/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "theme_selected", theme }),
    })
  } catch {
    // Silent fail - don't block UX
  }
}

export async function notifyPurchase(item: string, amount?: number): Promise<void> {
  try {
    await fetch("/api/discord/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "purchase_completed", purchase: { item, amount } }),
    })
  } catch {
    // Silent fail
  }
}
