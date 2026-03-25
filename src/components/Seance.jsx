import { useState } from "react"
import { Plus, Trash2, CheckCircle2, Circle, Timer, Flame, ChevronDown, ChevronUp, Zap, RotateCcw, FileText } from "lucide-react"

const TYPES = [
  { v:"cardio",  l:"Cardio",       emoji:"🏃" },
  { v:"muscu",   l:"Muscu",        emoji:"💪" },
  { v:"yoga",    l:"Yoga",         emoji:"🧘" },
  { v:"hiit",    l:"HIIT",         emoji:"🔥" },
  { v:"natation",l:"Natation",     emoji:"🏊" },
  { v:"sport",   l:"Sport",        emoji:"⚽" },
  { v:"autre",   l:"Autre",        emoji:"🏅" },
]

const TEMPLATES = [
  { label:"Push (Poitrine/Épaules/Triceps)", emoji:"💪", exercices:[
    { type:"muscu", nom:"Développé couché", series:"4", reps:"8", poids:"", duree:"" },
    { type:"muscu", nom:"Développé incliné haltères", series:"3", reps:"10", poids:"", duree:"" },
    { type:"muscu", nom:"Élévations latérales", series:"3", reps:"15", poids:"", duree:"" },
    { type:"muscu", nom:"Dips triceps", series:"3", reps:"12", poids:"", duree:"" },
  ]},
  { label:"Pull (Dos/Biceps)", emoji:"🔙", exercices:[
    { type:"muscu", nom:"Tractions", series:"4", reps:"8", poids:"", duree:"" },
    { type:"muscu", nom:"Rowing barre", series:"3", reps:"10", poids:"", duree:"" },
    { type:"muscu", nom:"Curl biceps", series:"3", reps:"12", poids:"", duree:"" },
    { type:"muscu", nom:"Face pull", series:"3", reps:"15", poids:"", duree:"" },
  ]},
  { label:"Legs (Jambes)", emoji:"🦵", exercices:[
    { type:"muscu", nom:"Squat", series:"4", reps:"8", poids:"", duree:"" },
    { type:"muscu", nom:"Presse à cuisses", series:"3", reps:"12", poids:"", duree:"" },
    { type:"muscu", nom:"Fentes", series:"3", reps:"10", poids:"", duree:"" },
    { type:"muscu", nom:"Mollets debout", series:"4", reps:"20", poids:"", duree:"" },
  ]},
  { label:"Full Body", emoji:"⚡", exercices:[
    { type:"muscu", nom:"Squat", series:"3", reps:"10", poids:"", duree:"" },
    { type:"muscu", nom:"Développé couché", series:"3", reps:"10", poids:"", duree:"" },
    { type:"muscu", nom:"Rowing haltères", series:"3", reps:"10", poids:"", duree:"" },
    { type:"cardio", nom:"Gainage", series:"3", reps:"", poids:"", duree:"1" },
  ]},
  { label:"Cardio HIIT 20 min", emoji:"🔥", exercices:[
    { type:"hiit", nom:"Jumping jacks", series:"4", reps:"30", poids:"", duree:"" },
    { type:"hiit", nom:"Burpees", series:"4", reps:"10", poids:"", duree:"" },
    { type:"hiit", nom:"Mountain climbers", series:"4", reps:"20", poids:"", duree:"" },
    { type:"cardio", nom:"Course sur place", series:"", reps:"", poids:"", duree:"2" },
  ]},
  { label:"Yoga & Mobilité", emoji:"🧘", exercices:[
    { type:"yoga", nom:"Salutation au soleil", series:"3", reps:"", poids:"", duree:"5" },
    { type:"yoga", nom:"Pigeon (chaque côté)", series:"2", reps:"", poids:"", duree:"2" },
    { type:"yoga", nom:"Étirements ischio-jambiers", series:"2", reps:"", poids:"", duree:"2" },
  ]},
]

const MET = { cardio:7, muscu:5, hiit:9, yoga:3, natation:8, sport:6, autre:5 }

export default function Seance({ data, updateEntry, getTodayEntry }) {
  const entry = getTodayEntry()
  const seances = entry.seances || []
  const [form, setForm] = useState({ type:"muscu", nom:"", duree:"", series:"", reps:"", poids:"", note:"" })
  const [showForm, setShowForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showNote, setShowNote] = useState(null)

  const add = () => {
    if (!form.nom.trim()) return
    const s = { id: Date.now(), ...form, nom: form.nom.trim(), done: false }
    updateEntry({ seances: [...seances, s] })
    setForm({ type:"muscu", nom:"", duree:"", series:"", reps:"", poids:"", note:"" })
    setShowForm(false)
  }

  const loadTemplate = (tpl) => {
    const news = tpl.exercices.map((e, i) => ({ id: Date.now() + i, ...e, done: false, note:"" }))
    updateEntry({ seances: [...seances, ...news] })
    setShowTemplates(false)
  }

  const toggle = id => updateEntry({ seances: seances.map(s => s.id===id ? {...s, done:!s.done} : s) })
  const remove = id => updateEntry({ seances: seances.filter(s => s.id!==id) })
  const updateNote = (id, note) => updateEntry({ seances: seances.map(s => s.id===id ? {...s, note} : s) })
  const reset = () => updateEntry({ seances: [] })

  const done = seances.filter(s => s.done).length
  const totalMin = seances.filter(s => s.done && s.duree).reduce((a,s) => a + parseInt(s.duree||0), 0)
  const totalVolume = seances.filter(s => s.done && s.series && s.reps && s.poids)
    .reduce((a,s) => a + (parseInt(s.series||0) * parseInt(s.reps||0) * parseFloat(s.poids||0)), 0)
  const calories = seances.filter(s => s.done).reduce((a,s) => {
    const met = MET[s.type] || 5
    const min = parseInt(s.duree||0) || (s.series && s.reps ? parseInt(s.series||0) * parseInt(s.reps||0) * 0.05 : 0)
    return a + Math.round(met * 70 * min / 60)
  }, 0)

  return (
    <div className="space-y-3 fade-in">
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-bold text-lg">Séance du jour</h2>
          <div className="flex items-center gap-2">
            {totalMin > 0 && <span className="flex items-center gap-1 text-white/50 text-xs"><Timer size={11}/> {totalMin} min</span>}
            {calories > 0 && <span className="flex items-center gap-1 text-orange-400/70 text-xs"><Flame size={11}/> ~{calories} kcal</span>}
            <span className="text-white/50 text-xs">{done}/{seances.length}</span>
          </div>
        </div>

        {seances.length > 0 && (
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-4">
            <div className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${Math.round((done/seances.length)*100)}%` }} />
          </div>
        )}

        {totalVolume > 0 && (
          <div className="mb-3 px-3 py-2 rounded-xl text-xs text-white/40" style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.1)" }}>
            Volume total : <span className="text-white/60 font-medium">{Math.round(totalVolume).toLocaleString()} kg</span>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => { setShowForm(!showForm); setShowTemplates(false) }}
            className="flex-1 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <Plus size={14}/> Exercice
          </button>
          <button onClick={() => { setShowTemplates(!showTemplates); setShowForm(false) }}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <Zap size={14}/> Templates
          </button>
          {seances.length > 0 && (
            <button onClick={reset} className="flex items-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors">
              <RotateCcw size={12}/> Reset
            </button>
          )}
        </div>

        {showTemplates && (
          <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
            <p className="text-white/40 text-xs mb-2">Choisir un template</p>
            {TEMPLATES.map((tpl, i) => (
              <button key={i} onClick={() => loadTemplate(tpl)}
                className="w-full text-left px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-white/20 transition-all text-sm text-white/70 hover:text-white">
                {tpl.emoji} {tpl.label}
                <span className="ml-2 text-white/30 text-xs">{tpl.exercices.length} exercices</span>
              </button>
            ))}
          </div>
        )}

        {showForm && (
          <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
            <div className="flex gap-2">
              <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} className="input w-32 flex-shrink-0">
                {TYPES.map(t => <option key={t.v} value={t.v}>{t.emoji} {t.l}</option>)}
              </select>
              <input value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))}
                placeholder="Nom (ex: Squat, Course...)" className="input flex-1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.duree} onChange={e => setForm(f=>({...f,duree:e.target.value}))}
                placeholder="Durée (min)" type="number" className="input" />
              <input value={form.series} onChange={e => setForm(f=>({...f,series:e.target.value}))}
                placeholder="Séries" type="number" className="input" />
              <input value={form.reps} onChange={e => setForm(f=>({...f,reps:e.target.value}))}
                placeholder="Reps" type="number" className="input" />
              <input value={form.poids} onChange={e => setForm(f=>({...f,poids:e.target.value}))}
                placeholder="Poids (kg)" type="number" className="input" />
            </div>
            <input value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))}
              placeholder="Note (optionnel)" className="input w-full" />
            <div className="flex gap-2">
              <button onClick={add} className="btn-primary flex-1">Ajouter</button>
              <button onClick={() => setShowForm(false)} className="btn-outline">Annuler</button>
            </div>
          </div>
        )}
      </div>

      {seances.length === 0 ? (
        <div className="card text-center py-10 text-white/40 text-sm">Aucun exercice. Ajoute ta séance ou choisis un template !</div>
      ) : (
        <div className="space-y-2">
          {seances.map(s => {
            const t = TYPES.find(t => t.v===s.type) || TYPES[6]
            return (
              <div key={s.id} className={`card transition-all ${s.done ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(s.id)} className="flex-shrink-0">
                    {s.done ? <CheckCircle2 size={20} className="text-white/40"/> : <Circle size={20} className="text-white/40"/>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${s.done ? "line-through text-white/40" : "text-white/80"}`}>
                      {t.emoji} {s.nom}
                    </span>
                    <div className="flex gap-3 mt-0.5 text-xs text-white/40 flex-wrap">
                      {s.duree && <span><Timer size={10} className="inline mr-0.5"/>{s.duree} min</span>}
                      {s.series && <span>{s.series} séries</span>}
                      {s.reps && <span>× {s.reps} reps</span>}
                      {s.poids && <span>{s.poids} kg</span>}
                      {s.series && s.reps && s.poids && (
                        <span className="text-purple-400/60">Vol: {Math.round(parseInt(s.series)*parseInt(s.reps)*parseFloat(s.poids))} kg</span>
                      )}
                    </div>
                    {s.note && <p className="text-xs text-white/30 mt-1 italic">{s.note}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setShowNote(showNote===s.id ? null : s.id)} className="btn-ghost p-1.5">
                      <FileText size={13} className={s.note ? "text-purple-400/60" : ""}/>
                    </button>
                    <button onClick={() => remove(s.id)} className="btn-ghost p-1.5">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
                {showNote === s.id && (
                  <div className="mt-2 pt-2 border-t border-white/[0.06]">
                    <input value={s.note||""} onChange={e => updateNote(s.id, e.target.value)}
                      placeholder="Ajouter une note..." className="input w-full text-xs" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {done === seances.length && seances.length > 0 && (
        <div className="card text-center py-4" style={{ border:"1px solid rgba(139,92,246,0.2)" }}>
          <p className="text-white/70 text-sm">🔥 Séance complète !</p>
          <p className="text-white/40 text-xs mt-1">
            {totalMin > 0 && `${totalMin} min · `}
            {totalVolume > 0 && `${Math.round(totalVolume).toLocaleString()} kg de volume · `}
            {calories > 0 && `~${calories} kcal`}
          </p>
        </div>
      )}
    </div>
  )
}