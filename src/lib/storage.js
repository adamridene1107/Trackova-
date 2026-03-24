const KEY = "goaltracker_v2"
const DEVOIRS_KEY = "goaltracker_devoirs"

export function loadData() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY)) || defaultData()
    // Migration: importer les devoirs depuis l'ancienne cle localStorage
    if (!data.devoirs) {
      try {
        const old = JSON.parse(localStorage.getItem(DEVOIRS_KEY) || "[]")
        data.devoirs = old
      } catch { data.devoirs = [] }
    }
    return data
  } catch { return defaultData() }
}
export function saveData(d) { localStorage.setItem(KEY, JSON.stringify(d)) }

function defaultData() {
  return {
    goal: null, entries: {}, streak: 0, missions: [], devoirs: [],
    notifications: { enabled: false, time: "20:00" },
    createdAt: new Date().toISOString(),
  }
}