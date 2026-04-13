const NOTIF_TIMER_KEY = "_trakova_notif_timer"

export function scheduleNotification(hourMin, title, body) {
  if (typeof window === "undefined") return
  const [h, m] = hourMin.split(":").map(Number)
  const now = new Date()
  const next = new Date()
  next.setHours(h, m, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  const delay = next.getTime() - now.getTime()
  if (window[NOTIF_TIMER_KEY]) clearTimeout(window[NOTIF_TIMER_KEY])
  window[NOTIF_TIMER_KEY] = setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.svg", badge: "/favicon.svg" })
    }
    scheduleNotification(hourMin, title, body)
  }, delay)
}

export function cancelNotification() {
  if (typeof window === "undefined") return
  if (window[NOTIF_TIMER_KEY]) { clearTimeout(window[NOTIF_TIMER_KEY]); window[NOTIF_TIMER_KEY] = null }
}

export function initNotifications() {
  try {
    const s = JSON.parse(localStorage.getItem("gt_settings") || "{}")
    if (!s.notifDaily || Notification.permission !== "granted") return
    const time = s.notifHour || "08:00"
    const msg = s.notifMsg || "C'est l'heure de bosser ! Ouvre Trakova et check ta journée."
    scheduleNotification(time, "🔥 Trakova — Rappel du jour", msg)
  } catch {}
}
