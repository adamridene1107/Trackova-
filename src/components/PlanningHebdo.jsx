import { useState } from "react"
import { Plus, Trash2, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Pencil } from "lucide-react"
import { format } from "date-fns"
import AgendaView from "./AgendaView"

const JOURS = [
  { id: 1, court: "Lun", long: "Lundi" },
  { id: 2, court: "Mar", long: "Mardi" },
  { id: 3, court: "Mer", long: "Mercredi" },
  { id: 4, court: "Jeu", long: "Jeudi" },
  { id: 5, court: "Ven", long: "Vendredi" },
  { id: 6, court: "Sam", long: "Samedi" },
  { id: 0, court: "Dim", long: "Dimanche" },
]

const COULEURS = [
  { v: "violet", bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.3)", text: "#c4b5fd", dot: "#8b5cf6" },
  { v: "bleu",   bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.3)",  text: "#93c5fd", dot: "#3b82f6" },
  { v: "vert",   bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.28)",  text: "#86efac", dot: "#22c55e" },
  { v: "orange", bg: "rgba(251,146,60,0.15)",  border: "rgba(251,146,60,0.3)",  text: "#fdba74", dot: "#f97316" },
  { v: "rose",   bg: "rgba(236,72,153,0.15)",  border: "rgba(236,72,153,0.3)",  text: "#f9a8d4", dot: "#ec4899" },
  { v: "ambre",  bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.28)", text: "#fde68a", dot: "#fbbf24" },
]

// Créneaux toutes les 5 minutes de 07:00 à 01:00
const SLOTS_TIME = (() => {
  const slots = []
  for (let h = 7; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      slots.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`)
    }
  }
  for (let m = 0; m <= 60; m += 5) {
    slots.push(`${String(0).padStart(2,"0")}:${String(m).padStart(2,"0")}`)
  }
  return slots
})()

function toMin(t) {
  if (!t) return 9999
  const [h, m] = t.split(":").map(Number)
  return h < 7 ? (24 + h) * 60 + m : h * 60 + m
}

const todayDow = new Date().getDay()
const todayStr = format(new Date(), "yyyy-MM-dd")
const emptyForm = { title: "", time: "08:00", couleur: "violet", note: "" }

// Une tâche du planning est "faite aujourd'hui" si doneByDate contient la date du jour
function isDoneToday(task) {
  return (task.doneByDate || {})[todayStr] === true
}

export default function PlanningHebdo({ weekPlan, updateWeekPlan }) {
  const [selectedDay, setSelectedDay] = useState(todayDow === 0 ? 0 : todayDow)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [agendaNewTask, setAgendaNewTask] = useState("")
  const [agendaNewHour, setAgendaNewHour] = useState("08:00")

  const dayTasks = [...(weekPlan[selectedDay] || [])].sort((a, b) => toMin(a.time) - toMin(b.time))

  // Convertir weekPlan tasks → format AgendaView (freeTasks)
  const agendaFreeTasks = dayTasks.map(t => ({
    id: t.id,
    text: t.title,
    hour: t.time ? t.time.slice(0, 5) : "08:00",
    priority: "medium",
    done: isDoneToday(t),
  }))

  const submit = () => {
    if (!form.title.trim()) return
    const dayList = weekPlan[selectedDay] || []
    if (editId) {
      updateWeekPlan({
        ...weekPlan,
        [selectedDay]: dayList.map(t => t.id === editId ? { ...t, ...form, title: form.title.trim() } : t)
      })
      setEditId(null)
    } else {
      updateWeekPlan({
        ...weekPlan,
        [selectedDay]: [...dayList, { id: Date.now(), ...form, title: form.title.trim(), done: false }]
      })
    }
    setForm(emptyForm); setShowForm(false)
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

  const startEdit = (task) => {
    setForm({ title: task.title, time: task.time || "08:00", couleur: task.couleur || "violet", note: task.note || "" })
    setEditId(task.id); setShowForm(true)
  }

  const cancelForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false) }

  // Statistiques de la semaine (basées sur aujourd'hui)
  const totalSemaine = Object.values(weekPlan).flat().length
  const doneTotal = Object.values(weekPlan).flat().filter(isDoneToday).length

  return (
    <div className="space-y-3 fade-in">

      {/* Hero */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Planning hebdo</h2>
            <p className="text-white/50 text-xs mt-0.5">
              {totalSemaine} tâches · {doneTotal} faites cette semaine
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: "#818cf8", letterSpacing: "-0.03em" }}>
              {totalSemaine ? Math.round(doneTotal / totalSemaine * 100) : 0}%
            </p>
            <p className="text-white/30 text-xs">semaine</p>
          </div>
        </div>
        {/* Barre semaine */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${totalSemaine ? doneTotal / totalSemaine * 100 : 0}%`, background: "var(--primary)" }} />
        </div>
        {/* Mini vue semaine */}
        <div className="mt-3 flex gap-1">
          {JOURS.map(j => {
            const count = (weekPlan[j.id] || []).length
            const done = (weekPlan[j.id] || []).filter(isDoneToday).length
            const isToday = j.id === todayDow
            const isSelected = j.id === selectedDay
            return (
              <button key={j.id} onClick={() => setSelectedDay(j.id)}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
                style={{
                  background: isSelected ? "var(--primary-dim)" : isToday ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isSelected ? "rgba(99,102,241,0.3)" : isToday ? "rgba(99,102,241,0.15)" : "transparent"}`,
                }}>
                <span className="text-[10px] font-semibold" style={{ color: isSelected ? "#a5b4fc" : isToday ? "#818cf8" : "rgba(255,255,255,0.4)" }}>
                  {j.court}
                </span>
                {count > 0 ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {(weekPlan[j.id] || []).slice(0, 3).map(t => {
                        const c = COULEURS.find(c => c.v === t.couleur) || COULEURS[0]
                        return <div key={t.id} className="w-1.5 h-1.5 rounded-full" style={{ background: isDoneToday(t) ? "rgba(255,255,255,0.15)" : c.dot }} />
                      })}
                    </div>
                    {count > 3 && <span className="text-[8px]" style={{ color: "rgba(255,255,255,0.2)" }}>+{count - 3}</span>}
                  </div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sélecteur de jour (tabs scrollables) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {JOURS.map(j => {
          const isToday = j.id === todayDow
          const isSelected = j.id === selectedDay
          const count = (weekPlan[j.id] || []).length
          return (
            <button key={j.id} onClick={() => setSelectedDay(j.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold"
              style={{
                background: isSelected ? "var(--primary-dim)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isSelected ? "rgba(99,102,241,0.3)" : isToday ? "rgba(99,102,241,0.15)" : "transparent"}`,
                color: isSelected ? "#a5b4fc" : isToday ? "#818cf8" : "rgba(255,255,255,0.45)",
              }}>
              {isToday && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#818cf8" }} />}
              {j.long}
              {count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: isSelected ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.08)", color: isSelected ? "#a5b4fc" : "rgba(255,255,255,0.4)" }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Formulaire */}
      <div className="card">
        <button onClick={() => showForm && !editId ? cancelForm() : setShowForm(v => !v)}
          className="w-full flex items-center justify-between text-sm font-medium text-white/60 hover:text-white transition-colors">
          <span className="flex items-center gap-2">
            <Plus size={15} />
            {editId ? "Modifier" : `Ajouter pour ${JOURS.find(j => j.id === selectedDay)?.long}`}
          </span>
          {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showForm && (
          <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Titre de la tâche" className="input w-full" autoFocus />

            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Clock size={14} className="text-white/40 flex-shrink-0" />
                <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="input flex-1">
                  {SLOTS_TIME.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Sélecteur de couleur */}
            <div>
              <p className="text-white/40 text-xs mb-2">Couleur</p>
              <div className="flex gap-2 flex-wrap">
                {COULEURS.map(c => (
                  <button key={c.v} type="button"
                    onClick={() => setForm(f => ({ ...f, couleur: c.v }))}
                    className="w-8 h-8 rounded-xl transition-all border-2 flex-shrink-0"
                    style={{
                      background: c.bg,
                      borderColor: form.couleur === c.v ? c.dot : "transparent",
                      boxShadow: form.couleur === c.v ? `0 0 0 1px ${c.dot}` : "none",
                    }}>
                    <div className="w-3 h-3 rounded-full mx-auto" style={{ background: c.dot }} />
                  </button>
                ))}
              </div>
            </div>

            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Note optionnelle…" className="input w-full resize-none" rows={2} />

            <div className="flex gap-2">
              <button onClick={submit} className="btn-primary flex-1">{editId ? "Enregistrer" : "Ajouter"}</button>
              <button onClick={cancelForm} className="btn-outline">Annuler</button>
            </div>
          </div>
        )}
      </div>

      {/* Agenda visuel du jour sélectionné */}
      <AgendaView
        freeTasks={agendaFreeTasks}
        recurringToday={[]}
        missions={[]}
        entry={{}}
        isRecDone={() => false}
        toggleRecurring={() => {}}
        toggleFree={(id) => toggle(id)}
        onTaskComplete={() => {}}
        updateEntry={() => {}}
        newTask={agendaNewTask}
        setNewTask={setAgendaNewTask}
        newTaskHour={agendaNewHour}
        setNewTaskHour={setAgendaNewHour}
        newTaskPrio="medium"
        setNewTaskPrio={() => {}}
        addFreeTask={() => {
          if (!agendaNewTask.trim()) return
          const dayList = weekPlan[selectedDay] || []
          updateWeekPlan({
            ...weekPlan,
            [selectedDay]: [...dayList, {
              id: Date.now(),
              title: agendaNewTask.trim(),
              time: agendaNewHour,
              couleur: "violet",
              note: "",
              doneByDate: {}
            }]
          })
          setAgendaNewTask("")
        }}
      />
    </div>
  )
}
