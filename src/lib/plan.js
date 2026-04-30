import { format } from "date-fns"

export const FREE_LIMITS = {
  freeTasks:  2,   // tâches ponctuelles par jour max
  missions:   1,   // mission max
  devoirs:    3,   // tâches max (ponctuelles)
  customTasks: 0,  // tâches personnalisées : bloquées
}

// Onglets bloqués en gratuit
export const LOCKED_TABS = new Set([
  "planning", "fichiers", "xp", "stats", "history", "referral",
  "calendar", "resources", "seance", "idees",
])

/**
 * Calcule si l'utilisateur a accès premium.
 * @param {object} settings - data.settings de Supabase
 * @returns boolean
 */
export function computeIsPremium(settings = {}) {
  if (settings.subscribed) return true
  if (settings.freeUntil) {
    const today = format(new Date(), "yyyy-MM-dd")
    return settings.freeUntil >= today
  }
  return false
}
