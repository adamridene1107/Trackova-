import { useState, useEffect } from "react"
import { getGoalById, getDailyContent } from "../lib/goals"
import { getDailyQuote } from "../lib/quotes"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import AnimatedCheckbox from "./AnimatedCheckbox"
import { CheckCircle2, Circle, Lightbulb, Zap, Plus, Trash2, Play, Pause, Clock, RefreshCw } from "lucide-react"
import Pomodoro from "./Pomodoro"
import PomodoroWidget from "./PomodoroWidget"

function fmtTime(s) {
  if (!s || s < 0) return "0:00"
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) return `${h}h${m.toString().padStart(2,"0")}`
  return `${m}:${r.toString().padStart(2,"0")}`
}

const HOURS = Array.from({ length: 17 }, (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`)
const PRIOS = [
  { v:"high",   l:"Haute",   c:"bg-red-500/10 text-red-400 border-red-500/20" },
  { v:"medium", l:"Moyenne", c:"bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { v:"low",    l:"Basse",   c:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
]

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)", letterSpacing: "0.1em" }}>
      {children}
    </p>
  )
}

export default function DailyCheck({ data, today, getTodayEntry, toggleTask, updateEntry, updateDevoirs, onTaskComplete, onFocusComplete, showPomodoro = true, isPremium = true, freeLimits = {} }) {
  const goal = getGoalById(data.goal)
  const entry = getTodayEntry()
  const daily = getDailyContent(data.goal, today)
  const quote = getDailyQuote(data.goal, today)
  const [victory, setVictory] = useState(() => getTodayEntry().victory || "")
  const [newTask, setNewTask] = useState("")
  const [newTaskHour, setNewTaskHour] = useState("08:00")
  const [newTaskPrio, setNewTaskPrio] = useState("medium")
  const [newFixedTask, setNewFixedTask] = useState("")
  const [humeur, setHumeur] = useState(() => getTodayEntry().humeur || "")

  // ─── Task timers ────────────────────────────────────────
  const timers = entry.timers || {}
  const [activeKey, setActiveKey] = useState(null)
  const [activeStart, setActiveStart] = useState(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!activeKey) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [activeKey])

  const getElapsed = (key) => {
    const base = timers[key] || 0
    if (activeKey === key && activeStart) return base + Math.floor((Date.now() - activeStart) / 1000)
    return base
  }

  const stopActive = () => {
    if (!activeKey || !activeStart) return timers
    const elapsed = Math.floor((Date.now() - activeStart) / 1000)
    return { ...timers, [activeKey]: (timers[activeKey] || 0) + elapsed }
  }

  const toggleTimer = (key) => {
    if (activeKey === key) {
      updateEntry({ timers: stopActive() })
      setActiveKey(null); setActiveStart(null)
    } else {
      if (activeKey) updateEntry({ timers: stopActive() })
      setActiveKey(key); setActiveStart(Date.now())
    }
  }

  const allTimerKeys = new Set([...Object.keys(timers), activeKey].filter(Boolean))
  const totalToday = [...allTimerKeys].reduce((sum, k) => sum + getElapsed(k), 0)

  const TimerChip = ({ keyId, done }) => {
    const t = getElapsed(keyId)
    if (done) {
      if (!t) return null
      return (
        <span className="text-[10px] tabular-nums px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1"
          style={{ color: "var(--text-faint)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
          <Clock size={9} />{fmtTime(t)}
        </span>
      )
    }
    const active = activeKey === keyId
    return (
      <button onClick={(e) => { e.stopPropagation(); toggleTimer(keyId) }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold tabular-nums flex-shrink-0 transition-all active:scale-95"
        style={{
          background: active ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.08)",
          border: `1px solid ${active ? "rgba(34,197,94,0.35)" : "rgba(99,102,241,0.2)"}`,
          color: active ? "#34d399" : "#a5b4fc",
          boxShadow: active ? "0 0 12px rgba(34,197,94,0.25)" : "none",
        }}
        title={active ? "Pause" : "Démarrer le chrono"}>
        {active ? <Pause size={10} /> : <Play size={10} />}
        {fmtTime(t)}
      </button>
    )
  }

  // ─── Tâches récurrentes ─────────────────────────────────
  const todayStr = today
  const todayDow = new Date().getDay()
  const allDevoirs = data.devoirs || []

  const recurringToday = allDevoirs.filter(d => {
    if (!d.recurring || d.recurring === "none") return false
    if (d.recurring === "daily") return true
    if (d.recurring === "weekly") return (d.recurDays || []).includes(todayDow)
    return false
  }).sort((a, b) => {
    const ta = a.time || "25:00", tb = b.time || "25:00"
    const fix = t => { const [h,m] = t.split(":").map(Number); return h < 7 ? (24+h)*60+m : h*60+m }
    return fix(ta) - fix(tb)
  })

  const isRecDone = (task) => (task.doneByDate || {})[todayStr] === true

  const toggleRecurring = (id) => {
    if (!updateDevoirs) return
    updateDevoirs(allDevoirs.map(d => {
      if (d.id !== id) return d
      const doneByDate = { ...(d.doneByDate || {}) }
      doneByDate[todayStr] = !doneByDate[todayStr]
      return { ...d, doneByDate }
    }))
  }

  const recDoneCount = recurringToday.filter(isRecDone).length

  if (!goal) return null

  const fixedDone  = (entry.tasks || []).filter(Boolean).length
  const fixedTotal = goal.tasks.length
  const freeTasks  = entry.freeTasks || []
  const freeDone   = freeTasks.filter(t => t.done).length
  const allTotal   = fixedTotal + freeTasks.length + (entry.customTasks || []).length
  const allDone    = fixedDone + freeDone + (entry.customTasks || []).filter(t => t.done).length
  const totalPct   = allTotal > 0 ? Math.round((allDone / allTotal) * 100) : 0

  const addFixedTask = () => {
    const text = newFixedTask.trim()
    if (!text) return
    updateEntry({ customTasks: [...(entry.customTasks || []), { id: Date.now(), text, done: false }] })
    setNewFixedTask("")
  }
  const toggleCustom = (id) => updateEntry({ customTasks: (entry.customTasks || []).map(t => t.id === id ? { ...t, done: !t.done } : t) })
  const removeCustom = (id) => updateEntry({ customTasks: (entry.customTasks || []).filter(t => t.id !== id) })

  const maxFreeTasks = freeLimits.freeTasks || Infinity
  const freeTasksAtLimit = !isPremium && freeTasks.length >= maxFreeTasks

  const addFreeTask = () => {
    const text = newTask.trim()
    if (!text || freeTasksAtLimit) return
    updateEntry({ freeTasks: [...freeTasks, { id: Date.now(), text, hour: newTaskHour, priority: newTaskPrio, done: false }] })
    setNewTask("")
  }
  const toggleFree = (id) => updateEntry({ freeTasks: freeTasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })
  const removeFree = (id) => updateEntry({ freeTasks: freeTasks.filter(t => t.id !== id) })

  const missions = (data.missions || []).filter(m => m.status !== "done")

  return (
    <div className="space-y-3 fade-in">

      {/* Quote */}
      <div className="px-4 py-3.5 rounded-2xl" style={{ background: "rgba(99,102,241,0.07)", borderLeft: "2px solid rgba(99,102,241,0.4)" }}>
        <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-muted)" }}>"{quote}"</p>
      </div>

      {/* Hero card */}
      <div className="card">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs capitalize mb-0.5" style={{ color: "var(--text-faint)" }}>
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
            <h2 className="font-bold text-lg" style={{ color: "var(--text)", letterSpacing: "-0.025em" }}>
              {goal.label}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold gradient-text" style={{ letterSpacing: "-0.03em" }}>{totalPct}%</p>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>{allDone}/{allTotal} tâches</p>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${totalPct}%` }} />
        </div>

        {/* Temps total aujourd'hui */}
        <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: activeKey ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <Clock size={13} style={{ color: "#a5b4fc" }} className={activeKey ? "animate-pulse" : ""} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)", letterSpacing: "0.1em" }}>Temps aujourd'hui</p>
            <p className="text-base font-bold tabular-nums" style={{ color: activeKey ? "#a5b4fc" : "var(--text)" }}>{fmtTime(totalToday)}</p>
          </div>
          {activeKey && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#34d399" }} />
              <span className="text-[10px] font-semibold" style={{ color: "#34d399" }}>ACTIF</span>
            </div>
          )}
        </div>
      </div>

      {/* Mood */}
      <div className="card">
        <SectionLabel>Comment tu te sens ?</SectionLabel>
        <div className="flex gap-1 justify-between">
          {[["😴","Fatigué"],["😐","Moyen"],["🙂","Bien"],["😄","Super"],["🔥","En feu"]].map(([e, l]) => (
            <button key={e}
              onClick={() => { setHumeur(e); updateEntry({ humeur: e }) }}
              className="flex flex-col items-center gap-1.5 py-2.5 px-3 rounded-xl flex-1 transition-all"
              style={{
                background: humeur === e ? "var(--primary-dim)" : "transparent",
                border: `1px solid ${humeur === e ? "rgba(99,102,241,0.28)" : "transparent"}`,
                transform: humeur === e ? "scale(1.05)" : "scale(1)",
              }}>
              <span className="text-lg">{e}</span>
              <span className="text-[10px]" style={{ color: humeur === e ? "var(--primary-light)" : "var(--text-faint)" }}>{l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Agenda récurrent */}
      {recurringToday.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "rgba(251,191,36,0.12)" }}>
                <RefreshCw size={11} style={{ color: "#fbbf24" }} />
              </div>
              <SectionLabel>Agenda récurrent</SectionLabel>
            </div>
            <span className="text-xs tabular-nums" style={{ color: "var(--text-faint)" }}>
              {recDoneCount}/{recurringToday.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1 rounded-full mb-3 overflow-hidden" style={{ background: "rgba(251,191,36,0.1)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${recurringToday.length ? recDoneCount/recurringToday.length*100 : 0}%`, background: "#fbbf24" }} />
          </div>
          <div className="space-y-1.5">
            {recurringToday.map(task => {
              const done = isRecDone(task)
              return (
                <div key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: done ? "rgba(251,191,36,0.05)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${done ? "rgba(251,191,36,0.15)" : "var(--border)"}`,
                    opacity: done ? 0.6 : 1,
                  }}>
                  <button onClick={() => { if (!done) onTaskComplete?.(); toggleRecurring(task.id) }} className="flex-shrink-0">
                    {done
                      ? <CheckCircle2 size={16} style={{ color: "#fbbf24" }} />
                      : <Circle size={16} style={{ color: "var(--text-faint)" }} />}
                  </button>
                  {task.time && (
                    <span className="text-xs font-mono flex-shrink-0 w-10 text-right" style={{ color: "#fbbf24", opacity: done ? 0.5 : 0.8 }}>
                      {task.time}
                    </span>
                  )}
                  <span className="flex-1 text-sm" style={{
                    color: done ? "var(--text-faint)" : "var(--text-muted)",
                    textDecoration: done ? "line-through" : "none",
                  }}>{task.title}</span>
                  <span className="text-[10px] flex-shrink-0 flex items-center gap-1" style={{ color: "var(--text-faint)" }}>
                    <RefreshCw size={8} />
                    {task.recurring === "daily" ? "quotidien" : "hebdo"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pomodoro — Pro seulement */}
      {showPomodoro && (isPremium
        ? <PomodoroWidget onFocusComplete={onFocusComplete} />
        : (
          <a href="/subscribe" className="card flex items-center gap-3 opacity-60 hover:opacity-80 transition-opacity" style={{ textDecoration: "none" }}>
            <Lock size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Minuteur Pomodoro</p>
              <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>Fonctionnalité Pro 🔒</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>Pro</span>
          </a>
        )
      )}

      {/* Fixed tasks */}
      <div className="card">
        <SectionLabel>Objectif du jour</SectionLabel>
        <div className="space-y-1.5">
          {goal.tasks.map((task, i) => {
            const done = !!entry.tasks?.[i]
            const tkey = `fixed-${i}`
            return (
              <div key={i}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                style={{
                  background: done ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${done ? "rgba(99,102,241,0.15)" : "var(--border)"}`,
                }}>
                <button onClick={() => {
                  if (!done) { onTaskComplete?.(); if (activeKey === tkey) { updateEntry({ timers: stopActive() }); setActiveKey(null); setActiveStart(null) } }
                  toggleTask(i)
                }} className="flex-shrink-0">
                  {done
                    ? <CheckCircle2 size={16} style={{ color: "var(--primary-light)" }} />
                    : <Circle      size={16} style={{ color: "var(--text-faint)" }} />}
                </button>
                <span className="flex-1 text-sm" style={{ color: done ? "var(--text-faint)" : "var(--text-muted)", textDecoration: done ? "line-through" : "none" }}>
                  {task}
                </span>
                {/* Chrono uniquement Pro */}
                {isPremium && <TimerChip keyId={tkey} done={done} />}
              </div>
            )
          })}

          {(entry.customTasks || []).map(t => {
            const tkey = `custom-${t.id}`
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: t.done ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${t.done ? "rgba(99,102,241,0.15)" : "var(--border)"}` }}>
                <button onClick={() => {
                  if (!t.done) { onTaskComplete?.(); if (activeKey === tkey) { updateEntry({ timers: stopActive() }); setActiveKey(null); setActiveStart(null) } }
                  toggleCustom(t.id)
                }} className="flex-shrink-0">
                  {t.done
                    ? <CheckCircle2 size={16} style={{ color: "var(--primary-light)" }} />
                    : <Circle      size={16} style={{ color: "var(--text-faint)" }} />}
                </button>
                <span className="flex-1 text-sm" style={{ color: t.done ? "var(--text-faint)" : "var(--text-muted)", textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                {isPremium && <TimerChip keyId={tkey} done={t.done} />}
                <button onClick={() => removeCustom(t.id)} className="flex-shrink-0 transition-colors" style={{ color: "var(--text-faint)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--text-muted)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-faint)"}>
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Ajout tâche personnalisée — Pro seulement */}
        {isPremium ? (
          <div className="flex gap-2 mt-3">
            <input value={newFixedTask} onChange={e => setNewFixedTask(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addFixedTask()}
              placeholder="Ajouter une tâche…"
              className="input flex-1 text-sm" />
            <button onClick={addFixedTask} className="btn-primary px-3 flex-shrink-0">
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <a href="/subscribe" className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl transition-opacity opacity-50 hover:opacity-70" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", textDecoration: "none" }}>
            <Lock size={12} style={{ color: "#fbbf24", flexShrink: 0 }} />
            <span className="text-xs" style={{ color: "#fbbf24" }}>Tâches personnalisées — Pro uniquement</span>
          </a>
        )}
      </div>

      {/* Tâches du jour */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Tâches du jour</SectionLabel>
          {!isPremium && (
            <span className="text-[10px] tabular-nums" style={{ color: "var(--text-faint)" }}>
              {freeTasks.length}/{maxFreeTasks}
            </span>
          )}
        </div>
        {/* Bannière limite */}
        {freeTasksAtLimit && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <span className="text-xs">🔒</span>
            <p className="text-[11px] flex-1" style={{ color: "#fbbf24" }}>
              Max {maxFreeTasks} tâches/jour — <a href="/subscribe" className="underline">Passer au Pro</a>
            </p>
          </div>
        )}
        <div className="flex gap-2 mb-3 flex-wrap">
          <select value={newTaskHour} onChange={e => setNewTaskHour(e.target.value)} className="input flex-shrink-0 text-sm" style={{ width: 90 }}
            disabled={freeTasksAtLimit}>
            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={newTaskPrio} onChange={e => setNewTaskPrio(e.target.value)} className="input flex-shrink-0 text-sm" style={{ width: 110 }}
            disabled={freeTasksAtLimit}>
            {PRIOS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
          <input value={newTask} onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addFreeTask()}
            placeholder={freeTasksAtLimit ? "Limite atteinte…" : "Nouvelle tâche…"}
            className="input flex-1 min-w-0 text-sm"
            disabled={freeTasksAtLimit} />
          <button onClick={addFreeTask} className="btn-primary px-3 flex-shrink-0"
            style={freeTasksAtLimit ? { opacity: 0.4, cursor: "not-allowed" } : {}}>
            <Plus size={14} />
          </button>
        </div>
        {freeTasks.length > 0 && (
          <div className="space-y-1.5">
            {[...freeTasks].sort((a, b) => a.hour.localeCompare(b.hour)).map(t => {
              const pr = PRIOS.find(p => p.v === t.priority) || PRIOS[1]
              return (
                <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-xl transition-all"
                  style={{ border: "1px solid var(--border)", opacity: t.done ? 0.5 : 1 }}>
                  <button onClick={() => { if (!t.done) onTaskComplete?.(); toggleFree(t.id) }} className="flex-shrink-0">
                    {t.done ? <CheckCircle2 size={15} style={{ color: "var(--primary-light)" }} /> : <Circle size={15} style={{ color: "var(--text-faint)" }} />}
                  </button>
                  <span className="text-xs font-mono w-10 flex-shrink-0" style={{ color: "var(--text-muted)" }}>{t.hour}</span>
                  <span className="flex-1 text-sm" style={{ color: t.done ? "var(--text-faint)" : "var(--text-muted)", textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                  <span className={`badge border text-[10px] flex-shrink-0 ${pr.c}`}>{pr.l}</span>
                  <button onClick={() => removeFree(t.id)} className="btn-ghost p-1.5"><Trash2 size={13} /></button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Victory */}
      <div className="card">
        <SectionLabel>Ma victoire du jour</SectionLabel>
        <textarea
          value={victory}
          onChange={e => setVictory(e.target.value)}
          onBlur={() => updateEntry({ victory })}
          placeholder="Qu'est-ce que tu as accompli aujourd'hui ?"
          className="input resize-none text-sm"
          rows={3} />
      </div>

      {/* Coach tips */}
      {daily && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="card">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                <Lightbulb size={12} style={{ color: "var(--primary-light)" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--text-faint)", letterSpacing: "0.08em" }}>ASTUCE</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{daily.tip}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                <Zap size={12} style={{ color: "var(--primary-light)" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--text-faint)", letterSpacing: "0.08em" }}>DÉFI</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{daily.challenge}</p>
          </div>
        </div>
      )}
    </div>
  )
}
