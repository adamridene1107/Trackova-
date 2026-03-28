import { useState } from "react"
import { Plus, Trash2, Lightbulb, Star, Tag } from "lucide-react"

const KEY = "goaltracker_idees"
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] } }
const persist = d => localStorage.setItem(KEY, JSON.stringify(d))

const TAGS = ["Concept", "Visuel", "Son", "Texte", "Technique", "Inspiration", "Autre"]

export default function Idees() {
  const [idees, setIdees] = useState(load)
  const [form, setForm] = useState({ titre:"", desc:"", tag:"Concept", fav:false })
  const [showForm, setShowForm] = useState(false)
  const [filterTag, setFilterTag] = useState("all")
  const [showFavOnly, setShowFavOnly] = useState(false)

  const save = d => { setIdees(d); persist(d) }

  const add = () => {
    if (!form.titre.trim()) return
    save([{ id: Date.now(), ...form, titre: form.titre.trim(), createdAt: new Date().toISOString() }, ...idees])
    setForm({ titre:"", desc:"", tag:"Concept", fav:false })
    setShowForm(false)
  }
  const toggleFav = id => save(idees.map(i => i.id===id ? {...i, fav:!i.fav} : i))
  const remove = id => save(idees.filter(i => i.id!==id))

  const filtered = idees.filter(i => {
    if (showFavOnly && !i.fav) return false
    if (filterTag !== "all" && i.tag !== filterTag) return false
    return true
  })

  return (
    <div className="space-y-3 fade-in">
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white font-bold text-lg">Idées</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFavOnly(!showFavOnly)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all ${showFavOnly ? "bg-white text-black" : "bg-white/[0.06] text-white/40"}`}>
              <Star size={11} className={showFavOnly ? "fill-black" : ""}/> Favoris
            </button>
          </div>
        </div>
        <p className="text-white/40 text-xs mb-4">Capture tes idées créatives avant qu'elles disparaissent.</p>
        <button onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <Plus size={14}/> Nouvelle idée
        </button>
        {showForm && (
          <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
            <input value={form.titre} onChange={e => setForm(f=>({...f,titre:e.target.value}))}
              placeholder="Titre de l'idée" className="input w-full" />
            <textarea value={form.desc} onChange={e => setForm(f=>({...f,desc:e.target.value}))}
              placeholder="Décris ton idée..." rows={3} className="input w-full resize-none" />
            <select value={form.tag} onChange={e => setForm(f=>({...f,tag:e.target.value}))} className="input w-full">
              {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={add} className="btn-primary flex-1">Sauvegarder</button>
              <button onClick={() => setShowForm(false)} className="btn-outline">Annuler</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterTag("all")} className={`pill ${filterTag==="all"?"pill-active":"pill-inactive"}`}>Toutes</button>
        {TAGS.map(t => (
          <button key={t} onClick={() => setFilterTag(filterTag===t?"all":t)}
            className={`pill ${filterTag===t?"pill-active":"pill-inactive"}`}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-10 text-white/40 text-sm">
          {idees.length === 0 ? "Aucune idée pour l'instant. Inspire-toi !" : "Aucune idée dans cette categorie."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(i => (
            <div key={i.id} className="card">
              <div className="flex items-start gap-3">
                <Lightbulb size={16} className="text-white/30 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white/80 text-sm font-medium">{i.titre}</p>
                    <span className="badge bg-white/[0.06] text-white/40 text-[10px]"><Tag size={9} className="inline mr-0.5"/>{i.tag}</span>
                  </div>
                  {i.desc && <p className="text-white/50 text-xs mt-1 leading-relaxed">{i.desc}</p>}
                </div>
                <button onClick={() => toggleFav(i.id)} className="flex-shrink-0 p-1">
                  <Star size={14} className={i.fav ? "fill-white text-white" : "text-white/30"} />
                </button>
                <button onClick={() => remove(i.id)} className="btn-ghost p-1.5 flex-shrink-0">
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}