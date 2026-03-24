import { useState, useEffect, useCallback } from "react"
import { loadData, saveData } from "../lib/storage"
import { format } from "date-fns"

export function useGoalTracker() {
  const [data, setData] = useState(() => loadData())
  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => { saveData(data) }, [data])

  const set = useCallback((fn) => setData(d => { const n = fn(d); saveData(n); return n }), [])

  const setGoal = useCallback((goalId) => set(d => {
    // Sauvegarder les donnees de l objectif actuel avant de changer
    const allGoals = d.allGoals || {}
    const currentSave = d.goal ? { entries: d.entries, streak: d.streak, missions: d.missions, devoirs: d.devoirs } : null
    if (currentSave && d.goal) allGoals[d.goal] = currentSave
    // Charger les donnees du nouvel objectif si elles existent
    const saved = allGoals[goalId] || {}
    return {
      ...d,
      goal: goalId,
      entries: saved.entries || {},
      streak: saved.streak || 0,
      missions: saved.missions || [],
      devoirs: saved.devoirs || [],
      allGoals,
      createdAt: d.createdAt || new Date().toISOString(),
    }
  }), [set])

  const resetGoal = useCallback(() => set(d => {
    const allGoals = d.allGoals || {}
    if (d.goal) allGoals[d.goal] = { entries: d.entries, streak: d.streak, missions: d.missions, devoirs: d.devoirs }
    return { ...d, goal: null, allGoals }
  }), [set])

  const getTodayEntry = useCallback(() =>
    data.entries[today] || { done: false, victory: "", tasks: [], dayPlan: [] }
  , [data.entries, today])

  const updateEntry = useCallback((updates) => set(d => {
    const entry = d.entries[today] || { done: false, victory: "", tasks: [], dayPlan: [] }
    const merged = { ...entry, ...updates }
    const entries = { ...d.entries, [today]: merged }
    return { ...d, entries, streak: computeStreak(entries) }
  }), [set, today])

  const toggleTask = useCallback((idx) => set(d => {
    const entry = d.entries[today] || { done: false, victory: "", tasks: [], dayPlan: [] }
    const tasks = [...(entry.tasks || [])]
    tasks[idx] = !tasks[idx]
    const done = tasks.length > 0 && tasks.every(Boolean)
    const entries = { ...d.entries, [today]: { ...entry, tasks, done } }
    return { ...d, entries, streak: computeStreak(entries) }
  }), [set, today])

  const updateMissions = useCallback((missions) => set(d => ({ ...d, missions })), [set])
  const updateNotifications = useCallback((notifications) => set(d => ({ ...d, notifications })), [set])
  const updateDevoirs = useCallback((devoirs) => set(d => ({ ...d, devoirs })), [set])

  return { data, today, setGoal, resetGoal, getTodayEntry, updateEntry, toggleTask, updateMissions, updateNotifications, updateDevoirs }
}

function computeStreak(entries) {
  let streak = 0, d = new Date()
  while (true) {
    const key = format(d, "yyyy-MM-dd")
    if (entries[key]?.done) { streak++; d.setDate(d.getDate() - 1) } else break
  }
  return streak
}