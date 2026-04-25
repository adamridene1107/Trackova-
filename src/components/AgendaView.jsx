import { useEffect, useRef, useState } from "react"
import { RefreshCw, CheckCircle2, Circle, Plus } from "lucide-react"
import { format } from "date-fns"

// 07:00 → 01:00 le lendemain
const SLOTS = [
  "07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00",
  "19:00","20:00","21:00","22:00","23:00","00:00","01:00",
]

function toMin(t) {
  if (!t) return 9999
  const [h, m] = t.split(":").map(Number)
  return h < 7 ? (24 + h) * 60 + m : h * 60 + m
}

function nowMinutes() {
  const n = new Date()
  const h = n.getHours(), m = n.getMinutes()
  return h < 7 ? (24 + h) * 60 + m : h * 60 + m
}

function slotMinutes(slot) { return toMin(slot) }

// Fraction (0-1) dans l'heure courante pour positionner la ligne rouge
function nowFraction(slotMin) {
  const nm = nowMinutes()
  const diff = nm - slotMin
  if (diff < 0 || diff >= 60) return null
  return diff / 60
}

const PRIOS = [
  { v:"high",   c:"rgba(239,68,68,0.15)",   border:"rgba(239,68,68,0.3)",   text:"#f87171" },
  { v:"medium", c:"rgba(251,191,36,0.12)",  border:"rgba(251,191,36,0.25)", text:"#fbbf24" },
  { v:"low",    c:"rgba(52,211,153,0.12)",  border:"rgba(52,211,153,0.25)", text:"#34d399" },
]

export default function AgendaView({
  recurringToday = [],
  freeTasks = [],
  missions = [],
  entry = {},
  isRecDone,
  toggleRecurring,
  toggleFree,
  onTaskComplete,
  updateEntry,
  newTask, setNewTask,
  newTaskHour, setNewTaskHour,
  newTaskPrio, setNewTaskPrio,
  addFreeTask,
}) {
  const nowRef = useRef(null)
  const [tick, setTick] = useState(0)

  // Scroll to current hour on mount
  useEffect(() => {
    const t = setTimeout(() => nowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 200)
    return () => clearTimeout(t)
  }, [])

  // Refresh every minute for the current-time indicator
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const nm = nowMinutes()
  const currentSlot = SLOTS.find((s, i) => {
    const sm = slotMinutes(s)
    const next = SLOTS[i + 1] ? slotMinutes(SLOTS[i + 1]) : sm + 60
    return nm >= sm && nm < next
  })

  return (
    <div className="card overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Agenda du jour</p>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            {format(new Date(), "EEEE d MMMM").charAt(0).toUpperCase() + format(new Date(), "EEEE d MMMM").slice(1)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#fbbf24" }} />
          <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>récurrent</span>
          <span className="w-2.5 h-2.5 rounded-full ml-2" style={{ background: "#818cf8" }} />
          <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>ponctuel</span>
        </div>
      </div>

      {/* Formulaire ajout rapide */}
      <div className="px-4 py-2.5 flex gap-2 items-center" style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.015)" }}>
        <select value={newTaskHour} onChange={e => setNewTaskHour(e.target.value)}
          className="input text-xs flex-shrink-0" style={{ width: "72px", padding: "6px 8px" }}>
          {SLOTS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <input value={newTask} onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addFreeTask()}
          placeholder="Ajouter au planning…"
          className="input flex-1 text-sm" style={{ padding: "6px 10px" }} />
        <button onClick={addFreeTask} className="btn-primary flex-shrink-0" style={{ padding: "6px 12px" }}>
          <Plus size={14} />
        </button>
      </div>

      {/* Grille */}
      <div className="relative" style={{ background: "var(--surface)" }}>
        {/* Ligne verticale timeline */}
        <div className="absolute top-0 bottom-0" style={{ left: 56, width: 1, background: "var(--border)", zIndex: 0 }} />

        {SLOTS.map((slot, idx) => {
          const sm = slotMinutes(slot)
          const isNow = slot === currentSlot
          const frac = nowFraction(sm)
          const rItems = recurringToday.filter(t => t.time && t.time.slice(0, 2) === slot.slice(0, 2))
          const fItems = freeTasks.filter(t => t.hour === slot)
          const mItems = missions.filter(m => (entry.missionHours || {})[m.id] === slot)
          const isEmpty = rItems.length === 0 && fItems.length === 0 && mItems.length === 0

          return (
            <div key={slot} ref={isNow ? nowRef : null}
              className="relative flex"
              style={{
                minHeight: isEmpty ? 44 : "auto",
                background: isNow ? "rgba(99,102,241,0.04)" : "transparent",
                borderBottom: idx < SLOTS.length - 1 ? "1px solid var(--border)" : "none",
              }}>

              {/* Heure */}
              <div className="flex-shrink-0 flex items-start pt-2.5 pr-3 pl-3"
                style={{ width: 56, textAlign: "right" }}>
                <span className="text-[11px] font-mono ml-auto"
                  style={{ color: isNow ? "var(--primary-light)" : "var(--text-faint)", fontWeight: isNow ? 700 : 400 }}>
                  {slot}
                </span>
              </div>

              {/* Dot sur la ligne */}
              <div className="flex-shrink-0 flex items-start pt-3.5" style={{ width: 1, zIndex: 1 }}>
                <div className="w-2 h-2 rounded-full -ml-1 flex-shrink-0 transition-all" style={{
                  background: isNow ? "var(--primary-light)" : isEmpty ? "transparent" : "rgba(99,102,241,0.4)",
                  boxShadow: isNow ? "0 0 0 3px rgba(99,102,241,0.2)" : "none",
                  border: isEmpty && !isNow ? "1px solid var(--border)" : "none",
                }} />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0 px-3 py-2 flex flex-col gap-1.5">
                {/* Ligne rouge heure courante */}
                {frac !== null && (
                  <div className="absolute left-0 right-0 flex items-center" style={{ top: `${frac * 100}%`, zIndex: 2, pointerEvents: "none" }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#f87171", marginLeft: 48 }} />
                    <div className="flex-1 h-px ml-1" style={{ background: "#f87171", opacity: 0.5 }} />
                  </div>
                )}

                {/* Tâches récurrentes */}
                {rItems.map(t => {
                  const done = isRecDone(t)
                  return (
                    <button key={t.id}
                      onClick={() => { if (!done) onTaskComplete?.(); toggleRecurring(t.id) }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-left w-full transition-all active:scale-98"
                      style={{
                        background: done ? "rgba(251,191,36,0.06)" : "rgba(251,191,36,0.12)",
                        border: `1px solid ${done ? "rgba(251,191,36,0.12)" : "rgba(251,191,36,0.28)"}`,
                        opacity: done ? 0.55 : 1,
                      }}>
                      {done
                        ? <CheckCircle2 size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />
                        : <Circle size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />}
                      <span className="flex-1 text-xs font-medium truncate"
                        style={{ color: done ? "var(--text-faint)" : "#fef3c7", textDecoration: done ? "line-through" : "none" }}>
                        {t.title}
                      </span>
                      {t.time && <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "#fbbf24", opacity: 0.7 }}>{t.time}</span>}
                      <RefreshCw size={9} style={{ color: "#fbbf24", opacity: 0.6, flexShrink: 0 }} />
                    </button>
                  )
                })}

                {/* Tâches ponctuelles */}
                {fItems.map(t => {
                  const pr = PRIOS.find(p => p.v === (t.priority || "medium")) || PRIOS[1]
                  return (
                    <button key={t.id}
                      onClick={() => { if (!t.done) onTaskComplete?.(); toggleFree(t.id) }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-left w-full transition-all active:scale-98"
                      style={{
                        background: t.done ? "rgba(99,102,241,0.04)" : "rgba(99,102,241,0.1)",
                        border: `1px solid ${t.done ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.22)"}`,
                        opacity: t.done ? 0.5 : 1,
                      }}>
                      {t.done
                        ? <CheckCircle2 size={14} style={{ color: "var(--primary-light)", flexShrink: 0 }} />
                        : <Circle size={14} style={{ color: "var(--primary-light)", flexShrink: 0 }} />}
                      <span className="flex-1 text-xs font-medium truncate"
                        style={{ color: t.done ? "var(--text-faint)" : "var(--text-muted)", textDecoration: t.done ? "line-through" : "none" }}>
                        {t.text}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: pr.c, border: `1px solid ${pr.border}`, color: pr.text }}>
                        {t.priority === "high" ? "!" : t.priority === "low" ? "↓" : "·"}
                      </span>
                    </button>
                  )
                })}

                {/* Missions placées */}
                {mItems.map(m => (
                  <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)" }}>
                    <span style={{ color: "#c084fc", flexShrink: 0 }}>◎</span>
                    <span className="truncate flex-1" style={{ color: "var(--text-muted)" }}>{m.text}</span>
                    <span className="flex-shrink-0 text-[9px]" style={{ color: "rgba(168,85,247,0.6)" }}>mission</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mission placement footer */}
      {missions.length > 0 && (
        <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-faint)" }}>Placer mes missions</p>
          <div className="space-y-1.5">
            {missions.map(m => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="flex-1 text-xs truncate" style={{ color: "var(--text-muted)" }}>{m.text}</span>
                <select
                  value={(entry.missionHours || {})[m.id] || ""}
                  onChange={e => {
                    const mh = { ...(entry.missionHours || {}), [m.id]: e.target.value || undefined }
                    if (!e.target.value) delete mh[m.id]
                    updateEntry?.({ missionHours: mh })
                  }}
                  className="input text-xs flex-shrink-0" style={{ width: "80px", padding: "4px 6px" }}>
                  <option value="">— heure —</option>
                  {SLOTS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
