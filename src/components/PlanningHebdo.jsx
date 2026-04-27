import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"

/* ── Constantes ───────────────────────────────────────── */
const HOUR_H   = 56          // px par heure
const START_H  = 7           // 07:00
const END_H    = 25          // 01:00 (lendemain)
const HOURS    = Array.from({ length: END_H - START_H }, (_, i) => START_H + i)
const DAYS_FR  = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"]

const SLOTS = (() => {
  const s = []
  for (let h = 7; h < 24; h++)
    for (let m = 0; m < 60; m += 5)
      s.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`)
  for (let m = 0; m <= 60; m += 5)
    s.push(`00:${String(m).padStart(2,"0")}`)
  return s
})()

const COLORS = [
  { v:"violet", bg:"rgba(139,92,246,0.28)", border:"#8b5cf6", text:"#e9d5ff" },
  { v:"bleu",   bg:"rgba(59,130,246,0.28)",  border:"#3b82f6", text:"#bfdbfe" },
  { v:"vert",   bg:"rgba(34,197,94,0.24)",   border:"#22c55e", text:"#bbf7d0" },
  { v:"orange", bg:"rgba(249,115,22,0.28)",  border:"#f97316", text:"#fed7aa" },
  { v:"rose",   bg:"rgba(236,72,153,0.28)",  border:"#ec4899", text:"#fbcfe8" },
  { v:"ambre",  bg:"rgba(245,158,11,0.28)",  border:"#f59e0b", text:"#fde68a" },
]

/* ── Helpers ──────────────────────────────────────────── */
function timeToOffset(time) {          // → heures depuis START_H
  if (!time) return 0
  const [h, m] = time.split(":").map(Number)
  const abs = h < START_H ? 24 + h : h
  return abs - START_H + m / 60
}

function snapTime(clientY, rectTop) {  // → "HH:MM" arrondi à 5 min
  const raw   = (clientY - rectTop) / HOUR_H + START_H
  const h     = Math.floor(raw)
  const m     = Math.round(((raw % 1) * 60) / 5) * 5
  const hFix  = (h + Math.floor(m / 60)) % 24
  const mFix  = m % 60
  return `${String(hFix).padStart(2,"0")}:${String(mFix).padStart(2,"0")}`
}

function addHour(time) {
  const [h, m] = time.split(":").map(Number)
  const next = (h + 1) % 24
  return `${String(next).padStart(2,"0")}:${String(m).padStart(2,"0")}`
}

/* ── Composant principal ──────────────────────────────── */
const EMPTY = { title:"", time:"08:00", endTime:"09:00", color:"violet", recurring:true }

export default function PlanningHebdo({ weekPlan: raw, updateWeekPlan }) {
  const events = Array.isArray(raw) ? raw : []

  const [offset,  setOffset]  = useState(0)
  const [modal,   setModal]   = useState(null)   // null | {mode,dow?,date?,event?}
  const [form,    setForm]    = useState(EMPTY)
  const gridRef = useRef(null)

  /* semaine affichée */
  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), offset * 7)
  const days      = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today     = new Date()

  /* heure courante */
  const nowOffset = timeToOffset(format(today, "HH:mm"))
  const nowTop    = nowOffset * HOUR_H

  /* événements pour un jour */
  const eventsFor = (day) => {
    const dow     = day.getDay()
    const dateStr = format(day, "yyyy-MM-dd")
    return events
      .filter(e => e.recurring ? e.dow === dow : e.date === dateStr)
      .sort((a, b) => timeToOffset(a.time) - timeToOffset(b.time))
  }

  /* clic sur la grille → ouvrir modal ajout */
  const onGridClick = (day, e) => {
    if (e.target !== e.currentTarget && !e.target.dataset.grid) return
    const colRect = e.currentTarget.getBoundingClientRect()
    const time    = snapTime(e.clientY, colRect.top + (e.currentTarget.scrollTop||0))
    const et      = addHour(time)
    setForm({ ...EMPTY, time, endTime: et })
    setModal({ mode:"add", dow: day.getDay(), date: format(day,"yyyy-MM-dd") })
  }

  /* clic sur un événement → modal édition */
  const onEventClick = (ev, e) => {
    e.stopPropagation()
    setForm({ title:ev.title, time:ev.time, endTime:ev.endTime||addHour(ev.time), color:ev.color||"violet", recurring:ev.recurring!==false })
    setModal({ mode:"edit", event:ev })
  }

  /* sauvegarder */
  const save = () => {
    if (!form.title.trim()) return
    if (modal.mode === "add") {
      updateWeekPlan([...events, {
        id: Date.now(),
        title: form.title.trim(),
        time: form.time, endTime: form.endTime,
        color: form.color,
        recurring: form.recurring,
        dow:  form.recurring ? modal.dow  : undefined,
        date: form.recurring ? undefined  : modal.date,
      }])
    } else {
      const e = modal.event
      updateWeekPlan(events.map(ev => ev.id !== e.id ? ev : {
        ...ev,
        title: form.title.trim(), time: form.time, endTime: form.endTime,
        color: form.color, recurring: form.recurring,
        dow:  form.recurring ? (e.dow ?? new Date(e.date).getDay()) : undefined,
        date: form.recurring ? undefined : (e.date || format(today,"yyyy-MM-dd")),
      }))
    }
    setModal(null)
  }

  const del = () => { updateWeekPlan(events.filter(e => e.id !== modal.event.id)); setModal(null) }

  /* ── Rendu ─────────────────────────────────────────── */
  return (
    <div className="fade-in space-y-3">

      {/* Navigation semaine */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button onClick={() => setOffset(o => o-1)} className="btn-ghost p-2"><ChevronLeft size={18}/></button>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">
              {format(weekStart,"d MMM",{locale:fr})} – {format(addDays(weekStart,6),"d MMM yyyy",{locale:fr})}
            </p>
            {offset !== 0 && (
              <button onClick={() => setOffset(0)} className="text-[10px] underline mt-0.5" style={{color:"#818cf8"}}>
                Revenir à aujourd'hui
              </button>
            )}
          </div>
          <button onClick={() => setOffset(o => o+1)} className="btn-ghost p-2"><ChevronRight size={18}/></button>
        </div>
        <p className="text-center text-white/25 text-xs mt-2">Appuie sur un créneau pour ajouter un événement</p>
      </div>

      {/* Grille calendrier */}
      <div className="card p-0 overflow-hidden">

        {/* En-têtes jours */}
        <div className="flex" style={{borderBottom:"1px solid var(--border)"}}>
          <div style={{width:38,flexShrink:0}}/>
          {days.map((day,i) => {
            const isToday = isSameDay(day, today)
            return (
              <div key={i} className="flex-1 flex flex-col items-center py-2"
                style={{borderLeft: i>0 ? "1px solid var(--border)" : "none"}}>
                <span className="text-[10px] font-bold uppercase tracking-wide"
                  style={{color: isToday ? "#818cf8" : "rgba(255,255,255,0.28)"}}>
                  {DAYS_FR[day.getDay()]}
                </span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{background: isToday ? "#6366f1" : "transparent"}}>
                  <span className="text-xs font-bold"
                    style={{color: isToday ? "#fff" : "rgba(255,255,255,0.5)"}}>
                    {format(day,"d")}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Zone scrollable */}
        <div ref={gridRef} style={{overflowY:"auto", maxHeight:"62vh"}}>
          <div className="flex relative" style={{height:(END_H-START_H)*HOUR_H}}>

            {/* Labels heures */}
            <div style={{width:38,flexShrink:0,position:"relative",zIndex:1}}>
              {HOURS.map(h => (
                <div key={h} style={{height:HOUR_H,display:"flex",alignItems:"flex-start",
                  paddingTop:4,justifyContent:"center"}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",fontFamily:"monospace"}}>
                    {String(h<24?h:h-24).padStart(2,"0")}h
                  </span>
                </div>
              ))}
            </div>

            {/* Colonnes jours */}
            {days.map((day, di) => {
              const isToday = isSameDay(day, today)
              const dayEvs  = eventsFor(day)
              return (
                <div key={di}
                  className="flex-1 relative"
                  style={{
                    borderLeft:"1px solid var(--border)",
                    background: isToday ? "rgba(99,102,241,0.025)" : "transparent",
                    cursor:"crosshair",
                  }}
                  onClick={e => {
                    // éviter de déclencher si on a cliqué un event
                    if (e.target.closest("[data-event]")) return
                    const colRect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - colRect.top
                    const rawH = START_H + y / HOUR_H
                    const h = Math.floor(rawH)
                    const m = Math.round(((rawH%1)*60)/5)*5
                    const hf = (h + Math.floor(m/60)) % 24
                    const mf = m % 60
                    const time = `${String(hf).padStart(2,"0")}:${String(mf).padStart(2,"0")}`
                    setForm({ ...EMPTY, time, endTime: addHour(time) })
                    setModal({ mode:"add", dow:day.getDay(), date:format(day,"yyyy-MM-dd") })
                  }}>

                  {/* Lignes heure */}
                  {HOURS.map(h => (
                    <div key={h} style={{position:"absolute",top:(h-START_H)*HOUR_H,
                      left:0,right:0,height:1,background:"rgba(255,255,255,0.04)",pointerEvents:"none"}}/>
                  ))}
                  {/* Demi-heures */}
                  {HOURS.map(h => (
                    <div key={"h"+h} style={{position:"absolute",top:(h-START_H)*HOUR_H+HOUR_H/2,
                      left:0,right:0,height:1,background:"rgba(255,255,255,0.02)",pointerEvents:"none"}}/>
                  ))}

                  {/* Ligne heure courante */}
                  {isToday && nowOffset>=0 && nowOffset<=(END_H-START_H) && (
                    <div style={{position:"absolute",left:0,right:0,top:nowTop,zIndex:4,pointerEvents:"none"}}>
                      <div style={{height:2,background:"#f87171",boxShadow:"0 0 6px rgba(248,113,113,0.5)"}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:"#f87171",
                          position:"absolute",left:-4,top:-3}}/>
                      </div>
                    </div>
                  )}

                  {/* Événements */}
                  {dayEvs.map(ev => {
                    const c      = COLORS.find(c => c.v===ev.color)||COLORS[0]
                    const top    = timeToOffset(ev.time) * HOUR_H
                    const dur    = Math.max(timeToOffset(ev.endTime||addHour(ev.time)) - timeToOffset(ev.time), 0.4)
                    const height = dur * HOUR_H
                    return (
                      <div key={ev.id} data-event="1"
                        onClick={e => onEventClick(ev,e)}
                        style={{
                          position:"absolute", left:2, right:2, top, height: Math.max(height,22),
                          background:c.bg, border:`1.5px solid ${c.border}`,
                          borderRadius:8, padding:"3px 6px", zIndex:2, cursor:"pointer", overflow:"hidden",
                        }}>
                        <p style={{fontSize:11,fontWeight:700,color:c.text,
                          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.3}}>
                          {ev.title}
                        </p>
                        {height > 34 && (
                          <p style={{fontSize:9,color:c.border,opacity:0.85,marginTop:1}}>
                            {ev.time}{ev.endTime ? ` – ${ev.endTime}` : ""}
                            {ev.recurring ? "  ↻" : ""}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3"
          style={{background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)"}}
          onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div className="w-full max-w-sm rounded-2xl p-4 space-y-3 slide-up"
            style={{background:"var(--surface-2)",border:"1px solid var(--border-strong)",
              overflowY:"auto", maxHeight:"92vh"}}>

            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-base">
                {modal.mode==="add" ? "Nouvel événement" : "Modifier l'événement"}
              </h3>
              <div className="flex gap-1">
                {modal.mode==="edit" && (
                  <button onClick={del} className="btn-ghost p-2" style={{color:"#f87171"}}>
                    <Trash2 size={15}/>
                  </button>
                )}
                <button onClick={() => setModal(null)} className="btn-ghost p-2"><X size={15}/></button>
              </div>
            </div>

            <input autoFocus value={form.title}
              onChange={e => setForm(f=>({...f,title:e.target.value}))}
              onKeyDown={e => e.key==="Enter" && save()}
              placeholder="Ex : Réveil, Sport, Cours de maths…"
              className="input w-full text-sm"/>

            {/* Heures */}
            <div className="flex items-center gap-2">
              <select value={form.time} onChange={e => setForm(f=>({...f,time:e.target.value}))}
                className="input flex-1 text-sm">
                {SLOTS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <span className="text-white/30 text-sm">→</span>
              <select value={form.endTime} onChange={e => setForm(f=>({...f,endTime:e.target.value}))}
                className="input flex-1 text-sm">
                {SLOTS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Récurrence */}
            <div className="flex gap-2">
              <button onClick={() => setForm(f=>({...f,recurring:true}))}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: form.recurring ? "var(--primary-dim)" : "rgba(255,255,255,0.04)",
                  border:`1px solid ${form.recurring ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: form.recurring ? "#a5b4fc" : "rgba(255,255,255,0.35)",
                }}>
                ↻ Chaque semaine
              </button>
              <button onClick={() => setForm(f=>({...f,recurring:false}))}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: !form.recurring ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)",
                  border:`1px solid ${!form.recurring ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: !form.recurring ? "#fbbf24" : "rgba(255,255,255,0.35)",
                }}>
                📅 Une seule fois
              </button>
            </div>

            {/* Couleurs */}
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button key={c.v} onClick={() => setForm(f=>({...f,color:c.v}))}
                  className="flex-1 h-7 rounded-lg transition-all"
                  style={{
                    background:c.bg,
                    border:`2px solid ${form.color===c.v ? c.border : "transparent"}`,
                    boxShadow: form.color===c.v ? `0 0 8px ${c.border}55` : "none",
                  }}/>
              ))}
            </div>

            <button onClick={save} className="btn-primary w-full py-3 text-sm">
              {modal.mode==="add" ? "Ajouter" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
