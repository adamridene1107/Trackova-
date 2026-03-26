import { useState } from "react"
import { getGoalById, getDailyContent } from "../lib/goals"
import { getDailyQuote } from "../lib/quotes"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CheckCircle2, Circle, Trophy, Lightbulb, Zap, Flame, Plus, Trash2, Clock, ChevronUp, ChevronDown } from "lucide-react"
import Pomodoro from "./Pomodoro"
import PomodoroWidget from "./PomodoroWidget"

const HOURS = Array.from({ length: 17 }, (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`)
const PRIOS = [
  { v:"high",   l:"Haute",   c:"bg-red-500/10 text-red-400 border-red-500/20" },
  { v:"medium", l:"Moyenne", c:"bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { v:"low",    l:"Basse",   c:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
]

export default function DailyCheck({ data, today, getTodayEntry, toggleTask, updateEntry, onTaskComplete, onFocusComplete, showPomodoro = true }) {
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

  if (!goal) return null

  const fixedDone = (entry.tasks || []).filter(Boolean).length
  const fixedTotal = goal.tasks.length
  const freeTasks = entry.freeTasks || []
  const freeDone = freeTasks.filter(t => t.done).length
  const allTotal = fixedTotal + freeTasks.length + (entry.customTasks || []).length
  const allDone = fixedDone + freeDone + (entry.customTasks || []).filter(t => t.done).length
  const totalPct = allTotal > 0 ? Math.round((allDone / allTotal) * 100) : 0

  const addFixedTask = () => {
    const text = newFixedTask.trim()
    if (!text) return
    const custom = entry.customTasks || []
    updateEntry({ customTasks: [...custom, { id: Date.now(), text, done: false }] })
    setNewFixedTask("")
  }
  const toggleCustom = (id) => {
    const custom = (entry.customTasks || []).map(t => t.id === id ? { ...t, done: !t.done } : t)
    updateEntry({ customTasks: custom })
  }
  const removeCustom = (id) => updateEntry({ customTasks: (entry.customTasks || []).filter(t => t.id !== id) })

  const addFreeTask = () => {
    const text = newTask.trim()
    if (!text) return
    updateEntry({ freeTasks: [...freeTasks, { id: Date.now(), text, hour: newTaskHour, priority: newTaskPrio, done: false }] })
    setNewTask("")
  }
  const toggleFree = (id) => updateEntry({ freeTasks: freeTasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })
  const removeFree = (id) => updateEntry({ freeTasks: freeTasks.filter(t => t.id !== id) })
  const moveFree = (i, d) => {
    const sorted = [...freeTasks].sort((a,b) => a.hour.localeCompare(b.hour))
    const j = i + d
    if (j < 0 || j >= sorted.length) return
    ;[sorted[i], sorted[j]] = [sorted[j], sorted[i]]
    updateEntry({ freeTasks: sorted })
  }

  const missions = (data.missions || []).filter(m => m.status !== "done")

  return (
    <div className="space-y-3 fade-in">

      {/* Citation du jour */}
      <div className="card" style={{ borderLeft:"3px solid rgba(139,92,246,0.5)" }}>
        <p className="text-white/60 text-sm italic leading-relaxed">"{quote}"</p>
      </div>

      {/* Hero */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/50 text-xs capitalize">
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
            <h2 className="text-white font-bold text-lg mt-0.5">{goal.label}</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.06] rounded-full px-3 py-1.5">
            <Flame size={12} className="text-white/50" />
            <span className="text-white/60 text-xs font-medium">{data.streak}j</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs">{allDone}/{allTotal} taches</span>
          <span className="text-white/50 text-xs font-semibold">{totalPct}%</span>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${totalPct}%` }} />
        </div>
      </div>

      {/* Humeur */}
      <div className="card">
        <p className="text-white/40 text-xs mb-3">Comment tu te sens ?</p>
        <div className="flex gap-2 justify-around">
          {[["😴","Fatigue"],["😐","Moyen"],["🙂","Bien"],["😄","Super"],["🔥","En feu"]].map(([e,l]) => (
            <button key={e} onClick={() => { setHumeur(e); updateEntry({ humeur: e }) }}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                humeur===e ? "bg-white/10 ring-1 ring-white/20 scale-110" : "hover:bg-white/[0.07]"
              }`}>
              <span className="text-xl">{e}</span>
              <span className="text-[10px] text-white/50">{l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pomodoro */}      {showPomodoro && <PomodoroWidget onFocusComplete={onFocusComplete} />}
      {showPomodoro && false && <Pomodoro onFocusComplete={onFocusComplete} />}

      {/* Objectif du jour */}
      <div className="card">
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Objectif du jour</h3>
        <div className="space-y-1.5">
          {goal.tasks.map((task, i) => (
            <button key={i} onClick={() => { if (!entry.tasks?.[i]) onTaskComplete?.(); toggleTask(i) }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                entry.tasks?.[i]
                  ? "bg-white/[0.07] border-white/[0.08]"
                  : "bg-transparent border-white/[0.06] hover:border-white/[0.12]"
              }`}>
              {entry.tasks?.[i]
                ? <CheckCircle2 size={17} className="text-white/40 flex-shrink-0" />
                : <Circle size={17} className="text-white/40 flex-shrink-0" />}
              <span className={`text-sm ${entry.tasks?.[i] ? "line-through text-white/40" : "text-white/70"}`}>
                {task}
              </span>
            </button>
          ))}

          {(entry.customTasks || []).map(t => (
            <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              t.done ? "bg-white/[0.07] border-white/[0.08]" : "border-white/[0.06]"
            }`}>
              <button onClick={() => { if (!t.done) onTaskComplete?.(); toggleCustom(t.id) }} className="flex-shrink-0">
                {t.done
                  ? <CheckCircle2 size={17} className="text-white/40" />
                  : <Circle size={17} className="text-white/40" />}
              </button>
              <span className={`flex-1 text-sm ${t.done ? "line-through text-white/40" : "text-white/70"}`}>{t.text}</span>
              <button onClick={() => removeCustom(t.id)} className="text-white/40 hover:text-white/50 transition-colors flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <input value={newFixedTask} onChange={e => setNewFixedTask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addFixedTask()}
            placeholder="Ajouter une tache..."
            className="input flex-1 text-sm" />
          <button onClick={addFixedTask} className="btn-primary px-3 flex-shrink-0">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Taches libres */}
      <div className="card">
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Taches du jour</h3>
        <div className="flex gap-2 flex-wrap mb-3">
          <select value={newTaskHour} onChange={e => setNewTaskHour(e.target.value)}
            className="input w-24 flex-shrink-0">
            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={newTaskPrio} onChange={e => setNewTaskPrio(e.target.value)}
            className="input flex-shrink-0 w-28">
            {PRIOS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
          <input value={newTask} onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addFreeTask()}
            placeholder="Nouvelle tache..."
            className="input flex-1 min-w-0" />
          <button onClick={addFreeTask} className="btn-primary px-3 flex-shrink-0">
            <Plus size={14} />
          </button>
        </div>

        {freeTasks.length > 0 && (
          <>
            <div className="h-px bg-white/[0.06] mb-3" />
            <div className="space-y-1.5">
              {[...freeTasks].sort((a,b) => a.hour.localeCompare(b.hour)).map((t, i) => {
                const pr = PRIOS.find(p => p.v === t.priority) || PRIOS[1]
                return (
                  <div key={t.id} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                    t.done ? "border-white/[0.08] opacity-40" : "border-white/[0.06] hover:border-white/[0.12]"
                  }`}>
                    <div className="flex flex-col flex-shrink-0">
                      <button onClick={() => moveFree(i,-1)} className="text-white/40 hover:text-white/50"><ChevronUp size={11}/></button>
                      <button onClick={() => moveFree(i,1)} className="text-white/40 hover:text-white/50"><ChevronDown size={11}/></button>
                    </div>
                    <span className="text-xs font-mono text-white/50 w-10 flex-shrink-0">{t.hour}</span>
                    <button onClick={() => { if (!t.done) onTaskComplete?.(); toggleFree(t.id) }} className="flex-shrink-0">
                      {t.done
                        ? <CheckCircle2 size={16} className="text-white/40" />
                        : <Circle size={16} className="text-white/40" />}
                    </button>
                    <span className={`flex-1 text-sm ${t.done ? "line-through text-white/40" : "text-white/70"}`}>{t.text}</span>
                    <span className={`badge border text-[10px] flex-shrink-0 ${pr.c}`}>{pr.l}</span>
                    <button onClick={() => removeFree(t.id)} className="text-white/40 hover:text-white/50 transition-colors flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Planning */}
      <div className="card">
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Planning</h3>
        <p className="text-white/40 text-xs mb-4">Taches et missions heure par heure</p>
        <div className="relative">
          <div className="absolute left-10 top-0 bottom-0 w-px bg-white/[0.07]" />
          <div className="space-y-0">
            {HOURS.map(hour => {
              const slots = freeTasks.filter(t => t.hour === hour)
              const mSlots = missions.filter(m => (entry.missionHours || {})[m.id] === hour)
              const hasContent = slots.length > 0 || mSlots.length > 0
              const isNow = format(new Date(), "HH:00") === hour
              return (
                <div key={hour} className={`flex gap-3 min-h-[36px] ${hasContent ? "py-2" : "py-1"}`}>
                  <div className={`w-10 flex-shrink-0 text-right text-xs font-mono pt-0.5 ${isNow ? "text-white/70" : "text-white/40"}`}>
                    {hour}
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center pt-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full z-10 ${
                      isNow ? "bg-white ring-2 ring-white/20" : hasContent ? "bg-white/30" : "bg-white/10"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {slots.map(t => {
                      const pr = PRIOS.find(p => p.v === t.priority) || PRIOS[1]
                      return (
                        <div key={t.id} onClick={() => toggleFree(t.id)}
                          className={`mb-1 flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all text-sm border ${
                            t.done
                              ? "border-white/[0.08] text-white/40 line-through"
                              : "border-white/[0.08] text-white/70 hover:border-white/20"
                          }`}>
                          <span className="truncate flex-1">{t.text}</span>
                          <span className={`badge border text-[10px] flex-shrink-0 ${pr.c}`}>{pr.l}</span>
                        </div>
                      )
                    })}
                    {mSlots.map(m => (
                      <div key={m.id} className="mb-1 flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border border-white/[0.08] text-white/50">
                        <span className="text-white/50 flex-shrink-0">◎</span>
                        <span className="truncate">{m.text}</span>
                        <span className="ml-auto text-[10px] text-white/40 flex-shrink-0">mission</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {missions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">Placer mes missions</p>
            <div className="space-y-2">
              {missions.map(m => (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-white/60 truncate">{m.text}</span>
                  <select
                    value={(entry.missionHours || {})[m.id] || ""}
                    onChange={e => {
                      const mh = { ...(entry.missionHours || {}), [m.id]: e.target.value || undefined }
                      if (!e.target.value) delete mh[m.id]
                      updateEntry({ missionHours: mh })
                    }}
                    className="input text-xs w-24 flex-shrink-0">
                    <option value="">-- heure --</option>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Victoire */}
      <div className="card">
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Ma victoire du jour</h3>
        <textarea value={victory}
          onChange={e => setVictory(e.target.value)}
          onBlur={() => updateEntry({ victory })}
          placeholder="Qu est-ce que tu as accompli aujourd hui ?"
          className="input resize-none" rows={3} />
      </div>

      {/* Coach */}
      {daily && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} className="text-white/40" />
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Astuce</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{daily.tip}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-white/40" />
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Defi</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{daily.challenge}</p>
          </div>
        </div>
      )}
    </div>
  )
}