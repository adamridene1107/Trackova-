import { useState } from "react"
import { Plus, Trash2, CheckCircle2, Circle, Calendar, ChevronDown, ChevronUp, Pencil, Bell, RefreshCw, Clock } from "lucide-react"
import { getCategoriesForGoal } from "../lib/categories"
import { format, isPast, isToday, isTomorrow, parseISO, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"

const PRIOS = [
  { v:"high",   l:"Haute",   c:"bg-red-500/10 text-red-400 border-red-500/20" },
  { v:"medium", l:"Moyenne", c:"bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { v:"low",    l:"Basse",   c:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
]

const JOURS = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"]

const TIPS = [
  "Commence par le devoir le plus difficile quand tu es encore frais.",
  "Fais des pauses de 5 min toutes les 25 min (technique Pomodoro).",
  "Relis tes notes de cours avant de commencer un exercice.",
  "Un devoir fait à l'avance vaut mieux que deux faits à la hâte.",
  "Pose des questions à ton prof si quelque chose n'est pas clair.",
  "Organise ton bureau avant de travailler pour mieux te concentrer.",
]

function getDateInfo(dateStr, done) {
  if (!dateStr || done) return null
  const d = parseISO(dateStr)
  const diff = differenceInDays(d, new Date())
  if (isPast(d) && !isToday(d)) return { label:"En retard", color:"text-red-400 font-semibold" }
  if (isToday(d)) return { label:"Aujourd'hui", color:"text-amber-400 font-semibold" }
  if (isTomorrow(d)) return { label:"Demain", color:"text-amber-400" }
  if (diff <= 3) return { label:`Dans ${diff} jours`, color:"text-white/40" }
  return { label:format(d, "d MMM yyyy", { locale:fr }), color:"text-white/50" }
}

const getEmpty = (cats) => ({
  title:"", desc:"", date:"", priority:"medium",
  matiere: cats[cats.length-1].v,
  recurring: "none", recurDays: [], time: ""
})

// Minutes depuis minuit, les heures <7 comptent comme >24h pour trier après minuit
function toAgendaMinutes(t) {
  if (!t) return 25 * 60
  const [h, m] = t.split(":").map(Number)
  return h < 7 ? (24 + h) * 60 + m : h * 60 + m
}

export default function Devoirs({ devoirs, updateDevoirs, goalId = "homework" }) {
  const MATIERES = getCategoriesForGoal(goalId)
  const [form, setForm] = useState(() => getEmpty(getCategoriesForGoal(goalId)))
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState("all")
  const [filterMat, setFilterMat] = useState("all")
  const [showAllRecurring, setShowAllRecurring] = useState(false)
  const tip = TIPS[new Date().getDay() % TIPS.length]

  const todayStr = format(new Date(), "yyyy-MM-dd")
  const todayDow = new Date().getDay()

  // --- Logique tâches récurrentes ---
  const isActiveToday = (task) => {
    if (!task.recurring || task.recurring === "none") return false
    if (task.recurring === "daily") return true
    if (task.recurring === "weekly") return (task.recurDays || []).includes(todayDow)
    return false
  }

  const isDoneToday = (task) => {
    if (!task.recurring || task.recurring === "none") return task.done
    return (task.doneByDate || {})[todayStr] === true
  }

  const toggleRecurring = (id) => {
    updateDevoirs(devoirs.map(d => {
      if (d.id !== id) return d
      const doneByDate = { ...(d.doneByDate || {}) }
      doneByDate[todayStr] = !doneByDate[todayStr]
      return { ...d, doneByDate }
    }))
  }

  // --- Séparation ponctuel / récurrent ---
  const recurringTasks = devoirs.filter(d => d.recurring && d.recurring !== "none")
  const oneTasks = devoirs.filter(d => !d.recurring || d.recurring === "none")

  const todayAgenda = recurringTasks
    .filter(isActiveToday)
    .sort((a, b) => toAgendaMinutes(a.time) - toAgendaMinutes(b.time))

  // --- Formulaire ---
  const submit = () => {
    if (!form.title.trim()) return
    if (editId) {
      updateDevoirs(devoirs.map(d => d.id === editId ? {
        ...d, ...form, title: form.title.trim(), desc: form.desc.trim()
      } : d))
      setEditId(null)
    } else {
      updateDevoirs([...devoirs, {
        id: Date.now(), ...form,
        title: form.title.trim(), desc: form.desc.trim(),
        done: false, doneByDate: {}
      }])
    }
    setForm(getEmpty(MATIERES)); setShowForm(false)
  }

  const startEdit = d => {
    setForm({
      title: d.title, desc: d.desc || "", date: d.date || "",
      priority: d.priority || "medium", matiere: d.matiere || "autre",
      recurring: d.recurring || "none", recurDays: d.recurDays || [], time: d.time || ""
    })
    setEditId(d.id); setShowForm(true)
  }
  const cancelForm = () => { setForm(getEmpty(MATIERES)); setEditId(null); setShowForm(false) }
  const toggle = id => updateDevoirs(devoirs.map(d => d.id === id ? { ...d, done: !d.done } : d))
  const remove = id => updateDevoirs(devoirs.filter(d => d.id !== id))

  const filtered = oneTasks.filter(d => {
    if (filter === "todo" && d.done) return false
    if (filter === "done" && !d.done) return false
    if (filter === "urgent" && (d.done || !d.date || (!isToday(parseISO(d.date)) && !isPast(parseISO(d.date))))) return false
    if (filterMat !== "all" && d.matiere !== filterMat) return false
    return true
  }).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const pa = PRIOS.findIndex(p => p.v === a.priority)
    const pb = PRIOS.findIndex(p => p.v === b.priority)
    if (pa !== pb) return pa - pb
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return a.date.localeCompare(b.date)
  })

  const urgentCount = oneTasks.filter(d => !d.done && d.date && (isToday(parseISO(d.date)) || isPast(parseISO(d.date)))).length
  const todoCount = oneTasks.filter(d => !d.done).length
  const doneAgendaCount = todayAgenda.filter(isDoneToday).length

  return (
    <div className="space-y-3 fade-in">

      {/* Hero */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Tâches</h2>
            <p className="text-white/50 text-xs mt-0.5">{todoCount} ponctuelle{todoCount>1?"s":""} à faire · {doneAgendaCount}/{todayAgenda.length} récurrentes aujourd'hui</p>
          </div>
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium px-2.5 py-1 rounded-full">
                ⚠ {urgentCount} urgent{urgentCount>1?"s":""}
              </span>
            )}
            <button onClick={() => "Notification" in window && Notification.requestPermission()} className="btn-ghost">
              <Bell size={15}/>
            </button>
          </div>
        </div>
      </div>

      {/* Conseil */}
      <div className="card">
        <p className="text-white/50 text-xs leading-relaxed">{tip}</p>
      </div>

      {/* ── AGENDA RÉCURRENT ── */}
      {recurringTasks.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <RefreshCw size={14} className="text-amber-400"/>
              <span className="text-white font-semibold text-sm">Agenda du jour</span>
            </div>
            <button onClick={() => setShowAllRecurring(v => !v)}
              className="text-white/40 text-xs flex items-center gap-1 min-h-[36px] px-1">
              <span className="hidden sm:inline">{showAllRecurring ? "Aujourd'hui seulement" : "Toutes les récurrentes"}</span>
              <span className="sm:hidden">{showAllRecurring ? "Aujourd'hui" : "Toutes"}</span>
              {showAllRecurring ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
            </button>
          </div>

          {/* Barre de progression */}
          {todayAgenda.length > 0 && (
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>{doneAgendaCount}/{todayAgenda.length} faites</span>
                <span>{Math.round(doneAgendaCount/todayAgenda.length*100)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${todayAgenda.length ? doneAgendaCount/todayAgenda.length*100 : 0}%` }}/>
              </div>
            </div>
          )}

          {/* Liste agenda */}
          {(showAllRecurring ? recurringTasks : todayAgenda).length === 0 ? (
            <p className="text-white/30 text-xs text-center py-3">Pas de tâches récurrentes aujourd'hui.</p>
          ) : (
            <div className="space-y-2">
              {(showAllRecurring ? [...recurringTasks].sort((a,b) => toAgendaMinutes(a.time)-toAgendaMinutes(b.time)) : todayAgenda).map(task => {
                const mat = MATIERES.find(m => m.v === (task.matiere||"autre")) || MATIERES[MATIERES.length-1]
                const done = isDoneToday(task)
                const activeToday = isActiveToday(task)
                return (
                  <div key={task.id} className={`flex items-center gap-2 sm:gap-3 rounded-xl px-2.5 sm:px-3 py-2.5 border transition-all ${
                    done
                      ? "bg-white/[0.02] border-white/[0.04] opacity-50"
                      : activeToday
                        ? "bg-amber-500/5 border-amber-500/15"
                        : "bg-white/[0.03] border-white/[0.06] opacity-60"
                  }`}>
                    {/* Heure */}
                    <div className="flex-shrink-0 w-12 text-right">
                      {task.time
                        ? <span className={`text-xs font-mono font-semibold ${done ? "text-white/30" : "text-amber-400"}`}>{task.time}</span>
                        : <Clock size={12} className="text-white/20 ml-auto"/>}
                    </div>
                    {/* Checkbox */}
                    <button onClick={() => toggleRecurring(task.id)} className="flex-shrink-0" disabled={!activeToday && !done}>
                      {done
                        ? <CheckCircle2 size={18} className="text-amber-400"/>
                        : <Circle size={18} className={activeToday ? "text-white/50" : "text-white/20"}/>}
                    </button>
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${done ? "line-through text-white/30" : "text-white/80"}`}>{task.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${mat.color}`}>{mat.emoji} {mat.l}</span>
                        <span className="text-[10px] text-white/30 flex items-center gap-0.5">
                          <RefreshCw size={9}/>
                          {task.recurring === "daily" ? "Quotidien" : (task.recurDays||[]).map(d => JOURS[d]).join(", ")}
                        </span>
                        {showAllRecurring && !activeToday && (
                          <span className="text-[10px] text-white/25">pas aujourd'hui</span>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(task)} className="btn-ghost p-1.5"><Pencil size={12}/></button>
                      <button onClick={() => remove(task.id)} className="btn-ghost p-1.5"><Trash2 size={12}/></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── FORMULAIRE ── */}
      <div className="card">
        <button onClick={() => showForm && !editId ? cancelForm() : setShowForm(!showForm)}
          className="w-full flex items-center justify-between text-sm font-medium text-white/60 hover:text-white transition-colors">
          <span className="flex items-center gap-2">
            <Plus size={15}/>
            {editId ? "Modifier la tâche" : "Ajouter une tâche"}
          </span>
          {showForm ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </button>

        {showForm && (
          <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
            <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
              placeholder="Titre de la tâche" className="input w-full" />
            <textarea value={form.desc} onChange={e => setForm(f=>({...f,desc:e.target.value}))}
              placeholder="Détails... (optionnel)" className="input w-full resize-none" rows={2} />
            <div className="flex gap-2 flex-wrap">
              <select value={form.matiere} onChange={e => setForm(f=>({...f,matiere:e.target.value}))}
                className="input flex-1">
                {MATIERES.map(m => <option key={m.v} value={m.v}>{m.emoji} {m.l}</option>)}
              </select>
              <select value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}
                className="input flex-shrink-0 w-32">
                {PRIOS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>

            {/* Récurrence */}
            <div className="flex items-center gap-2">
              <RefreshCw size={14} className="text-white/50 flex-shrink-0"/>
              <select value={form.recurring} onChange={e => setForm(f=>({...f, recurring:e.target.value, recurDays:[]}))}
                className="input flex-1">
                <option value="none">Pas de récurrence</option>
                <option value="daily">Tous les jours</option>
                <option value="weekly">Certains jours</option>
              </select>
            </div>

            {/* Sélection des jours (hebdo) */}
            {form.recurring === "weekly" && (
              <div className="flex gap-1.5 flex-wrap">
                {JOURS.map((jour, i) => (
                  <button key={i} type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      recurDays: f.recurDays.includes(i)
                        ? f.recurDays.filter(x => x !== i)
                        : [...f.recurDays, i]
                    }))}
                    className={`flex-1 min-w-[36px] py-2 rounded-lg text-xs font-medium transition-all border ${
                      form.recurDays.includes(i)
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-white/5 text-white/40 border-white/10"
                    }`}>
                    {jour}
                  </button>
                ))}
              </div>
            )}

            {/* Heure (si récurrent) */}
            {form.recurring !== "none" && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-white/50 flex-shrink-0"/>
                <input type="time" value={form.time}
                  onChange={e => setForm(f=>({...f,time:e.target.value}))}
                  className="input flex-1" />
                <span className="text-white/30 text-xs flex-shrink-0">7h00 → 01h00</span>
              </div>
            )}

            {/* Date (si ponctuel) */}
            {form.recurring === "none" && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-white/50 flex-shrink-0"/>
                <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} className="input flex-1"/>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={submit} className="btn-primary flex-1">{editId ? "Enregistrer" : "Ajouter"}</button>
              <button onClick={cancelForm} className="btn-outline">Annuler</button>
            </div>
          </div>
        )}
      </div>

      {/* ── TÂCHES PONCTUELLES ── */}
      {oneTasks.length > 0 && (
        <>
          <p className="text-white/30 text-xs px-1">Tâches ponctuelles</p>

          {/* Filtres */}
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              {[["all","Toutes"],["todo","À faire"],["urgent","Urgentes"],["done","Terminées"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`pill ${filter===v ? "pill-active" : "pill-inactive"}`}>
                  {v==="urgent"&&urgentCount>0?`${l} (${urgentCount})`:l}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilterMat("all")}
                className={`pill ${filterMat==="all" ? "pill-active" : "pill-inactive"}`}>
                Toutes
              </button>
              {MATIERES.map(m => (
                <button key={m.v} onClick={() => setFilterMat(filterMat===m.v?"all":m.v)}
                  className={`pill ${filterMat===m.v ? "pill-active" : "pill-inactive"}`}>
                  {m.emoji} {m.l}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="card text-center py-8 text-white/40 text-sm">
              Aucune tâche dans cette catégorie.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(d => {
                const pr = PRIOS.find(p => p.v===(d.priority||"medium"))||PRIOS[1]
                const mat = MATIERES.find(m => m.v===(d.matiere||"autre"))||MATIERES[MATIERES.length-1]
                const dateInfo = getDateInfo(d.date, d.done)
                return (
                  <div key={d.id} className={`card transition-all ${d.done ? "opacity-40" : ""}`}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggle(d.id)} className="flex-shrink-0 mt-0.5">
                        {d.done
                          ? <CheckCircle2 size={20} className="text-white/40"/>
                          : <Circle size={20} className="text-white/40"/>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-medium text-sm ${d.done ? "line-through text-white/40" : "text-white/80"}`}>{d.title}</p>
                          <span className={`badge text-[10px] ${mat.color}`}>{mat.emoji} {mat.l}</span>
                          <span className={`badge border text-[10px] ${pr.c}`}>{pr.l}</span>
                        </div>
                        {d.desc && <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{d.desc}</p>}
                        {d.date && dateInfo && (
                          <div className={`flex items-center gap-1 mt-1.5 text-xs ${dateInfo.color}`}>
                            <Calendar size={10}/><span>{dateInfo.label}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => startEdit(d)} className="btn-ghost p-1.5"><Pencil size={13}/></button>
                        <button onClick={() => remove(d.id)} className="btn-ghost p-1.5"><Trash2 size={13}/></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {devoirs.length === 0 && (
        <div className="card text-center py-10 text-white/40 text-sm">
          Aucune tâche pour l'instant.
        </div>
      )}
    </div>
  )
}
