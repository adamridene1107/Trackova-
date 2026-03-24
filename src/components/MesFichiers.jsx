import { useState, useRef } from "react"
import { Upload, Trash2, FileText, X, ChevronDown, ChevronUp, Eye } from "lucide-react"
import { getCategoriesForGoal } from "../lib/categories"

const KEY = "goaltracker_fichiers"
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] } }
const persist = d => localStorage.setItem(KEY, JSON.stringify(d))

const MATIERES = [
  { v:"maths",    l:"Maths",    emoji:"📐" },
  { v:"francais", l:"Francais", emoji:"��" },
  { v:"histoire", l:"Histoire", emoji:"🏛️" },
  { v:"geo",      l:"Geo",      emoji:"🌍" },
  { v:"sciences", l:"Sciences", emoji:"🔬" },
  { v:"anglais",  l:"Anglais",  emoji:"🇬🇧" },
  { v:"espagnol", l:"Espagnol", emoji:"🇪🇸" },
  { v:"autre",    l:"Autre",    emoji:"📚" },
]

function Viewer({ fichier, onClose }) {
  const { name, type, data } = fichier
  const isImage = type.startsWith("image/")
  const isPDF = type === "application/pdf"
  const isText = type.startsWith("text/")

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#111]">
        <span className="text-white/70 text-sm font-medium truncate max-w-xs">{name}</span>
        <button onClick={onClose} className="btn-ghost ml-2 flex-shrink-0"><X size={18}/></button>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {isImage && (
          <img src={data} alt={name} className="max-w-full max-h-full rounded-xl object-contain" />
        )}
        {isPDF && (
          <iframe src={data} title={name} className="w-full h-full rounded-xl border border-white/[0.08]" style={{minHeight:"70vh"}} />
        )}
        {isText && (
          <pre className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap max-w-2xl w-full bg-[#141414] p-4 rounded-xl border border-white/[0.08] overflow-auto max-h-[70vh]">
            {atob(data.split(",")[1])}
          </pre>
        )}
        {!isImage && !isPDF && !isText && (
          <div className="text-center space-y-3">
            <FileText size={48} className="text-white/20 mx-auto" />
            <p className="text-white/50 text-sm">Apercu non disponible pour ce type de fichier.</p>
            <a href={data} download={name}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
              Telecharger
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MesFichiers({ goalId = "homework" }) {
  const MATIERES = getCategoriesForGoal(goalId)
  const [fichiers, setFichiers] = useState(load)
  const [matiere, setMatiere] = useState(() => getCategoriesForGoal(goalId)[0].v)
  const [theme, setTheme] = useState("")
  const [filterMat, setFilterMat] = useState("all")
  const [viewing, setViewing] = useState(null)
  const inputRef = useRef()

  const save = d => { setFichiers(d); persist(d) }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const entry = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          matiere,
          theme: theme.trim() || "General",
          data: ev.target.result,
          addedAt: new Date().toISOString(),
        }
        setFichiers(prev => { const next = [...prev, entry]; persist(next); return next })
      }
      reader.readAsDataURL(file)
    })
    setTheme("")
    e.target.value = ""
  }

  const remove = id => save(fichiers.filter(f => f.id !== id))
  const fmt = b => b < 1024*1024 ? `${(b/1024).toFixed(0)} Ko` : `${(b/1024/1024).toFixed(1)} Mo`

  const filtered = filterMat === "all" ? fichiers : fichiers.filter(f => f.matiere === filterMat)
  const grouped = MATIERES.reduce((acc, m) => {
    const items = filtered.filter(f => f.matiere === m.v)
    if (items.length) acc[m.v] = { ...m, items }
    return acc
  }, {})

  return (
    <div className="space-y-3 fade-in">

      {viewing && <Viewer fichier={viewing} onClose={() => setViewing(null)} />}

      {/* Hero + upload */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-white font-bold text-lg">Fichiers</h2>
          <p className="text-white/50 text-xs mt-0.5">{fichiers.length} fichier{fichiers.length !== 1 ? "s" : ""} importe{fichiers.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select value={matiere} onChange={e => setMatiere(e.target.value)} className="input flex-shrink-0 w-32">
            {MATIERES.map(m => <option key={m.v} value={m.v}>{m.emoji} {m.l}</option>)}
          </select>
          <input value={theme} onChange={e => setTheme(e.target.value)}
            placeholder="Theme (ex: Fractions)"
            className="input flex-1 min-w-0" />
          <button onClick={() => inputRef.current.click()}
            className="btn-primary px-3 flex-shrink-0 flex items-center gap-1.5">
            <Upload size={13}/> Importer
          </button>
        </div>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles} />
      </div>

      {/* Filtres */}
      {fichiers.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterMat("all")}
            className={`pill ${filterMat==="all" ? "pill-active" : "pill-inactive"}`}>Tous</button>
          {MATIERES.filter(m => fichiers.some(f => f.matiere === m.v)).map(m => (
            <button key={m.v} onClick={() => setFilterMat(filterMat===m.v ? "all" : m.v)}
              className={`pill ${filterMat===m.v ? "pill-active" : "pill-inactive"}`}>
              {m.emoji} {m.l}
            </button>
          ))}
        </div>
      )}

      {/* Liste */}
      {fichiers.length === 0 ? (
        <div className="card text-center py-10 text-white/40 text-sm">Aucun fichier importe.</div>
      ) : Object.values(grouped).length === 0 ? (
        <div className="card text-center py-10 text-white/40 text-sm">Aucun fichier dans cette matiere.</div>
      ) : (
        Object.values(grouped).map(({ emoji, l, items }) => (
          <div key={l} className="card">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">{emoji} {l}</p>
            <div className="space-y-1.5">
              {items.map(f => (
                <div key={f.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all">
                  <FileText size={14} className="text-white/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm truncate">{f.name}</p>
                    <p className="text-white/40 text-[10px]">{f.theme} · {fmt(f.size)}</p>
                  </div>
                  <button onClick={() => setViewing(f)}
                    className="btn-ghost p-1.5 flex-shrink-0 flex items-center gap-1 text-xs text-white/50">
                    <Eye size={13}/> Voir
                  </button>
                  <button onClick={() => remove(f.id)} className="btn-ghost p-1.5 flex-shrink-0">
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}