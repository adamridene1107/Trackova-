import { useState } from "react"
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Dumbbell, Timer, Flame } from "lucide-react"
import { getCategoriesForGoal } from "../lib/categories"

const TYPES = [
  { v:"cardio",  l:"Cardio",   emoji:"🏃" },
  { v:"muscu",   l:"Muscu",    emoji:"💪" },
  { v:"yoga",    l:"Yoga",     emoji:"🧘" },
  { v:"sport",   l:"Sport",    emoji:"⚽" },
  { v:"autre",   l:"Autre",    emoji:"🏅" },
]

export default function Seance({ data, updateEntry, getTodayEntry }) {
  const entry = getTodayEntry()
  const seances = entry.seances || []
  const [form, setForm] = useState({ type:"cardio", nom:"", duree:"", series:"", reps:"", poids:"" })
  const [showForm, setShowForm] = useState(false)

  const add = () => {
    if (!form.nom.trim()) return
    const s = { id: Date.now(), ...form, nom: form.nom.trim(), done: false }
    updateEntry({ seances: [...seances, s] })
    setForm({ type:"cardio", nom:"", duree:"", series:"", reps:"", poids:"" })
    setShowForm(false)
  }
  const toggle = id => updateEntry({ seances: seances.map(s => s.id===id ? {...s, done:!s.done} : s) })
  const remove = id => updateEntry({ seances: seances.filter(s => s.id!==id) })

  const done = seances.filter(s => s.done).length
  const totalMin = seances.filter(s => s.done && s.duree).reduce((a,s) => a + parseInt(s.duree||0), 0)

  return (
    <div className="space-y-3 fade-in">
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-bold text-lg">Séance du jour</h2>
          <div className="flex items-center gap-2">
            {totalMin > 0 && (
              <span className="flex items-center gap-1 text-white/50 text-xs">
                <Timer size={11}/> {totalMin} min
              </span>
            )}
            <span className="text-white/50 text-xs">{done}/{seances.length}</span>
          </div>
        </div>
        {seances.length > 0 && (
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-4">
            <div className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${seances.length ? Math.round((done/seances.length)*100) : 0}%` }} />
          </div>
        )}

        <button onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <Plus size={14}/> Ajouter un exercice
        </button>

        {showForm && (
          <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
            <div className="flex gap-2">
              <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} className="input w-32 flex-shrink-0">
                {TYPES.map(t => <option key={t.v} value={t.v}>{t.emoji} {t.l}</option>)}
              </select>
              <input value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))}
                placeholder="Nom (ex: Squat, Course...)" className="input flex-1" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <input value={form.duree} onChange={e => setForm(f=>({...f,duree:e.target.value}))}
                placeholder="Durée (min)" type="number" className="input flex-1 min-w-0" />
              <input value={form.series} onChange={e => setForm(f=>({...f,series:e.target.value}))}
                placeholder="Séries" type="number" className="input flex-1 min-w-0" />
              <input value={form.reps} onChange={e => setForm(f=>({...f,reps:e.target.value}))}
                placeholder="Reps" type="number" className="input flex-1 min-w-0" />
              <input value={form.poids} onChange={e => setForm(f=>({...f,poids:e.target.value}))}
                placeholder="Poids (kg)" type="number" className="input flex-1 min-w-0" />
            </div>
            <div className="flex gap-2">
              <button onClick={add} className="btn-primary flex-1">Ajouter</button>
              <button onClick={() => setShowForm(false)} className="btn-outline">Annuler</button>
            </div>
          </div>
        )}
      </div>

      {seances.length === 0 ? (
        <div className="card text-center py-10 text-white/40 text-sm">Aucun exercice. Ajoute ta séance !</div>
      ) : (
        <div className="space-y-2">
          {seances.map(s => {
            const t = TYPES.find(t => t.v===s.type) || TYPES[4]
            return (
              <div key={s.id} className={`card flex items-center gap-3 transition-all ${s.done ? "opacity-50" : ""}`}>
                <button onClick={() => toggle(s.id)} className="flex-shrink-0">
                  {s.done ? <CheckCircle2 size={20} className="text-white/40"/> : <Circle size={20} className="text-white/40"/>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${s.done ? "line-through text-white/40" : "text-white/80"}`}>
                      {t.emoji} {s.nom}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-0.5 text-xs text-white/40 flex-wrap">
                    {s.duree && <span><Timer size={10} className="inline mr-0.5"/>{s.duree} min</span>}
                    {s.series && <span>{s.series} séries</span>}
                    {s.reps && <span>× {s.reps} reps</span>}
                    {s.poids && <span>{s.poids} kg</span>}
                  </div>
                </div>
                <button onClick={() => remove(s.id)} className="btn-ghost p-1.5 flex-shrink-0">
                  <Trash2 size={13}/>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {done === seances.length && seances.length > 0 && (
        <div className="card text-center py-4">
          <p className="text-white/60 text-sm">🔥 Séance complète ! {totalMin > 0 ? `${totalMin} min d'effort.` : ""}</p>
        </div>
      )}
    </div>
  )
}