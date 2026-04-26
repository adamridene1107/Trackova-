import { useState } from "react"
import { Plus, Trash2, Clock } from "lucide-react"
import { format } from "date-fns"

const JOURS = [
  { id: 1, court: "Lun", long: "Lundi" },
  { id: 2, court: "Mar", long: "Mardi" },
  { id: 3, court: "Mer", long: "Mercredi" },
  { id: 4, court: "Jeu", long: "Jeudi" },
  { id: 5, court: "Ven", long: "Vendredi" },
  { id: 6, court: "Sam", long: "Samedi" },
  { id: 0, court: "Dim", long: "Dimanche" },
]

// Créneaux toutes les 5 minutes de 07:00 à 01:00
const SLOTS = (() => {
  const s = []
  for (let h = 7; h < 24; h++)
    for (let m = 0; m < 60; m += 5)
      s.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`)
  for (let m = 0; m <= 60; m += 5)
    s.push(`${String(0).padStart(2,"0")}:${String(m).padStart(2,"0")}`)
  return s
})()

function toMin(t) {
  if (!t) return 9999
  const [h, m] = t.split(":").map(Number)
  return h < 7 ? (24 + h) * 60 + m : h * 60 + m
}

const todayDow = new Date().getDay()
const todayStr = format(new Date(), "yyyy-MM-dd")

export default function PlanningHebdo({ weekPlan, updateWeekPlan }) {
  const [selectedDay, setSelectedDay] = useState(todayDow)
  const [newTitle, setNewTitle] = useState("")
  const [newTime, setNewTime] = useState("08:00")

  const tasks = [...(weekPlan[selectedDay] || [])].sort((a, b) => toMin(a.time) - toMin(b.time))
  const jourNom = JOURS.find(j => j.id === selectedDay)?.long || ""

  const addTask = () => {
    if (!newTitle.trim()) return
    updateWeekPlan({
      ...weekPlan,
      [selectedDay]: [
        ...(weekPlan[selectedDay] || []),
        { id: Date.now(), title: newTitle.trim(), time: newTime, doneByDate: {} }
      ]
    })
    setNewTitle("")
  }

  const remove = (id) => updateWeekPlan({
    ...weekPlan,
    [selectedDay]: (weekPlan[selectedDay] || []).filter(t => t.id !== id)
  })

  const toggle = (id) => updateWeekPlan({
    ...weekPlan,
    [selectedDay]: (weekPlan[selectedDay] || []).map(t => {
      if (t.id !== id) return t
      const doneByDate = { ...(t.doneByDate || {}) }
      doneByDate[todayStr] = !doneByDate[todayStr]
      return { ...t, doneByDate }
    })
  })

  const isDone = (t) => (t.doneByDate || {})[todayStr] === true

  return (
    <div className="space-y-4 fade-in">

      {/* Titre */}
      <div className="card">
        <h2 className="text-white font-bold text-lg">Planning de la semaine</h2>
        <p className="text-white/40 text-xs mt-0.5">Tes tâches récurrentes jour par jour</p>
      </div>

      {/* Sélecteur de jour */}
      <div className="grid grid-cols-7 gap-1">
        {JOURS.map(j => {
          const isToday = j.id === todayDow
          const isSelected = j.id === selectedDay
          const count = (weekPlan[j.id] || []).length
          return (
            <button key={j.id} onClick={() => setSelectedDay(j.id)}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl transition-all"
              style={{
                background: isSelected
                  ? "var(--primary-dim)"
                  : isToday
                    ? "rgba(99,102,241,0.06)"
                    : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${isSelected ? "rgba(99,102,241,0.4)" : isToday ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)"}`,
              }}>
              <span className="text-[11px] font-bold"
                style={{ color: isSelected ? "#a5b4fc" : isToday ? "#818cf8" : "rgba(255,255,255,0.35)" }}>
                {j.court}
              </span>
              {count > 0
                ? <span className="text-[10px] font-semibold tabular-nums"
                    style={{ color: isSelected ? "#a5b4fc" : "rgba(255,255,255,0.25)" }}>{count}</span>
                : <span className="w-1 h-1 rounded-full" style={{ background: isSelected ? "#818cf8" : "rgba(255,255,255,0.1)" }} />
              }
            </button>
          )
        })}
      </div>

      {/* Formulaire d'ajout */}
      <div className="card space-y-3">
        <p className="text-white/60 text-sm font-medium">Ajouter pour {jourNom}</p>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 flex-shrink-0 rounded-xl px-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Clock size={13} className="text-white/30" />
            <select value={newTime} onChange={e => setNewTime(e.target.value)}
              className="bg-transparent text-white/70 text-sm outline-none py-2" style={{ minWidth: 60 }}>
              {SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder={`Ex : Réveil, Sport, Travail…`}
            className="input flex-1 text-sm"
          />
          <button onClick={addTask} className="btn-primary px-4 flex-shrink-0">
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Liste des tâches du jour */}
      {tasks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-white/30 text-sm font-medium">Rien pour {jourNom}</p>
          <p className="text-white/20 text-xs mt-1">Ajoute tes activités récurrentes ci-dessus</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {/* En-tête */}
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border)", background: "rgba(99,102,241,0.04)" }}>
            <span className="text-sm font-semibold text-white/80">{jourNom}</span>
            <span className="text-xs text-white/30">{tasks.length} tâche{tasks.length > 1 ? "s" : ""}</span>
          </div>
          {/* Lignes */}
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {tasks.map((task, i) => {
              const done = isDone(task)
              return (
                <div key={task.id}
                  className="flex items-center gap-0 transition-all"
                  style={{ opacity: done ? 0.45 : 1 }}>
                  {/* Heure */}
                  <button onClick={() => toggle(task.id)}
                    className="flex-shrink-0 flex items-center justify-center px-4 py-4 self-stretch transition-all"
                    style={{ minWidth: 72, background: done ? "rgba(99,102,241,0.04)" : "rgba(99,102,241,0.07)", borderRight: "1px solid var(--border)" }}>
                    <span className="text-xs font-mono font-bold"
                      style={{ color: done ? "rgba(255,255,255,0.2)" : "#a5b4fc" }}>
                      {task.time}
                    </span>
                  </button>
                  {/* Titre */}
                  <span className="flex-1 px-4 text-sm"
                    style={{
                      color: done ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.75)",
                      textDecoration: done ? "line-through" : "none",
                    }}>
                    {task.title}
                  </span>
                  {/* Supprimer */}
                  <button onClick={() => remove(task.id)}
                    className="flex-shrink-0 p-4 transition-colors"
                    style={{ color: "rgba(255,255,255,0.15)" }}
                    onTouchStart={e => e.currentTarget.style.color = "rgba(239,68,68,0.7)"}
                    onTouchEnd={e => e.currentTarget.style.color = "rgba(255,255,255,0.15)"}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
