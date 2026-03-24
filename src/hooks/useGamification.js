import { useState, useCallback } from "react"
import { format } from "date-fns"

const KEY = "goaltracker_xp"

export const LEVELS = [
  { level:1,  min:0,    label:"Debutant" },
  { level:2,  min:100,  label:"Apprenti" },
  { level:3,  min:250,  label:"Regulier" },
  { level:4,  min:500,  label:"Serieux" },
  { level:5,  min:900,  label:"Determine" },
  { level:6,  min:1400, label:"Expert" },
  { level:7,  min:2000, label:"Maitre" },
  { level:8,  min:2800, label:"Elite" },
  { level:9,  min:3800, label:"Legendaire" },
  { level:10, min:5000, label:"Ultime" },
]

function defaultData() {
  return {
    xp: 0, totalXp: 0, streak: 0, lastWorkDay: null,
    tasksCompleted: 0, focusSessions: 0, totalFocusMin: 0,
    bestStreak: 0, rewards: [], dailyGoal: 3, dailyDone: 0,
    dailyBonusGiven: false, lastDay: null, history: [],
  }
}

function load() {
  try { return { ...defaultData(), ...JSON.parse(localStorage.getItem(KEY) || "{}") } }
  catch { return defaultData() }
}

function persist(d) { localStorage.setItem(KEY, JSON.stringify(d)) }

export function getLevel(xp) {
  let cur = LEVELS[0]
  for (const l of LEVELS) { if (xp >= l.min) cur = l }
  const idx = LEVELS.indexOf(cur)
  const next = LEVELS[idx + 1] || null
  const pct = next ? Math.round(((xp - cur.min) / (next.min - cur.min)) * 100) : 100
  return { ...cur, next, pct, xpInLevel: xp - cur.min, xpNeeded: next ? next.min - cur.min : 0 }
}

const checkDay = (state) => {
  const today = format(new Date(), "yyyy-MM-dd")
  if (state.lastDay === today) return state
  return { ...state, dailyDone: 0, dailyBonusGiven: false, lastDay: today }
}
export function useGamification() {
  const [g, setG] = useState(load)

  const update = useCallback((fn) => {
    setG(prev => { const next = fn(prev); persist(next); return next })
  }, [])

  const onTaskComplete = useCallback(() => {
    update(prev => {
      const s = checkDay(prev)
      const today = format(new Date(), "yyyy-MM-dd")
      const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd")
      const newStreak = (s.lastWorkDay === yesterday || s.lastWorkDay === today)
        ? s.streak + (s.lastWorkDay !== today ? 1 : 0) : 1
      const bestStreak = Math.max(s.bestStreak || 0, newStreak)
      const streakBonus = (newStreak % 3 === 0 && s.lastWorkDay !== today) ? 20 : 0
      const newDailyDone = s.dailyDone + 1
      const dailyBonus = (newDailyDone >= s.dailyGoal && !s.dailyBonusGiven) ? 50 : 0
      const randomBonus = Math.random() < 0.1 ? Math.floor(Math.random() * 31) + 20 : 0
      const xp = 10 + streakBonus + dailyBonus + randomBonus
      const reasons = ["tache +10"]
      if (streakBonus) reasons.push("streak x" + newStreak + " +" + streakBonus)
      if (dailyBonus) reasons.push("objectif journalier +50")
      if (randomBonus) reasons.push("bonus aleatoire +" + randomBonus)
      const history = [...(s.history || []), { date: today, xp, reason: reasons.join(" · ") }].slice(-50)
      return {
        ...s, xp: s.xp + xp, totalXp: (s.totalXp || 0) + xp,
        streak: newStreak, bestStreak, lastWorkDay: today,
        tasksCompleted: (s.tasksCompleted || 0) + 1,
        dailyDone: newDailyDone,
        dailyBonusGiven: s.dailyBonusGiven || dailyBonus > 0,
        history, lastXP: { amount: xp, reasons },
      }
    })
  }, [update])

  const onFocusComplete = useCallback((minutes) => {
    update(prev => {
      const s = checkDay(prev)
      const today = format(new Date(), "yyyy-MM-dd")
      const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd")
      const newStreak = (s.lastWorkDay === yesterday || s.lastWorkDay === today)
        ? s.streak + (s.lastWorkDay !== today ? 1 : 0) : 1
      const bestStreak = Math.max(s.bestStreak || 0, newStreak)
      const randomBonus = Math.random() < 0.1 ? Math.floor(Math.random() * 31) + 20 : 0
      const xp = 5 + randomBonus
      const reasons = ["focus " + minutes + "min +5"]
      if (randomBonus) reasons.push("bonus aleatoire +" + randomBonus)
      const history = [...(s.history || []), { date: today, xp, reason: reasons.join(" · ") }].slice(-50)
      return {
        ...s, xp: s.xp + xp, totalXp: (s.totalXp || 0) + xp,
        streak: newStreak, bestStreak, lastWorkDay: today,
        focusSessions: (s.focusSessions || 0) + 1,
        totalFocusMin: (s.totalFocusMin || 0) + minutes,
        history, lastXP: { amount: xp, reasons },
      }
    })
  }, [update])

  const addReward = useCallback((reward) => {
    update(prev => ({ ...prev, rewards: [...(prev.rewards || []), { id: Date.now(), ...reward, unlocked: false }] }))
  }, [update])

  const unlockReward = useCallback((id) => {
    update(prev => {
      const reward = (prev.rewards || []).find(r => r.id === id)
      if (!reward || prev.xp < reward.cost) return prev
      return { ...prev, xp: prev.xp - reward.cost, rewards: prev.rewards.map(r => r.id === id ? { ...r, unlocked: true } : r) }
    })
  }, [update])

  const removeReward = useCallback((id) => {
    update(prev => ({ ...prev, rewards: (prev.rewards || []).filter(r => r.id !== id) }))
  }, [update])

  const setDailyGoal = useCallback((n) => {
    update(prev => ({ ...prev, dailyGoal: n }))
  }, [update])

  return { g, onTaskComplete, onFocusComplete, addReward, unlockReward, removeReward, setDailyGoal }
}