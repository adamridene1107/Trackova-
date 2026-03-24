import { useState } from "react"
import { Plus, Trash2, ChevronUp, ChevronDown, Circle, CheckCircle2 } from "lucide-react"
const P = [
  { v:"high",   l:"Haute",   c:"bg-red-100 text-red-700 border-red-200" },
  { v:"medium", l:"Moyenne", c:"bg-amber-100 text-amber-700 border-amber-200" },
  { v:"low",    l:"Basse",   c:"bg-green-100 text-green-700 border-green-200" },
]
export default function DayPlanner({ getTodayEntry, updateEntry }) {
  const entry = getTodayEntry()
  const tasks = entry.dayPlan || []
  const [txt, setTxt] = useState("")
  const [prio, setPrio] = useState("medium")
  const save = t => updateEntry({ dayPlan: t })
  const add = () => { if (!txt.trim()) return; save([...tasks,{id:Date.now(),text:txt.trim(),priority:prio,done:false}]); setTxt("") }
  const toggle = id => save(tasks.map(t => t.id===id ? {...t,done:!t.done} : t))
  const remove = id => save(tasks.filter(t => t.id!==id))
  const move = (i,d) => { const a=[...tasks]; const j=i+d; if(j<0||j>=a.length) return; [a[i],a[j]]=[a[j],a[i]]; save(a) }
  const done = tasks.filter(t=>t.done).length
  return (
    <div className="space-y-4 fade-in">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">📋 Planificateur du jour</h3>
          {tasks.length>0 && <span className="badge bg-indigo-50 text-indigo-600">{done}/{tasks.length} faites</span>}
        </div>
        {tasks.length>0 && (
          <div className="mb-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{width:`${Math.round((done/tasks.length)*100)}%`}} />
          </div>
        )}
        <div className="flex gap-2 mb-4">
          <input value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
            placeholder="Ajouter une tache..." className="input flex-1" />
          <select value={prio} onChange={e=>setPrio(e.target.value)}
            className="px-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 bg-white">
            {P.map(p=><option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
          <button onClick={add} className="btn-primary px-3 py-2"><Plus size={16}/></button>
        </div>
        {tasks.length===0
          ? <p className="text-slate-400 text-sm text-center py-8">Aucune tache. Ajoutes-en une !</p>
          : <div className="space-y-2">
              {tasks.map((t,i)=>{
                const pr=P.find(p=>p.v===t.priority)||P[1]
                return (
                  <div key={t.id} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${t.done?"bg-slate-50 border-slate-100 opacity-60":"bg-white border-slate-100 hover:border-indigo-200"}`}>
                    <div className="flex flex-col">
                      <button onClick={()=>move(i,-1)} className="text-slate-300 hover:text-slate-500"><ChevronUp size={13}/></button>
                      <button onClick={()=>move(i,1)} className="text-slate-300 hover:text-slate-500"><ChevronDown size={13}/></button>
                    </div>
                    <button onClick={()=>toggle(t.id)}>
                      {t.done ? <CheckCircle2 size={19} className="text-indigo-500"/> : <Circle size={19} className="text-slate-300"/>}
                    </button>
                    <span className={`flex-1 text-sm ${t.done?"line-through text-slate-400":"text-slate-700"}`}>{t.text}</span>
                    <span className={`badge border ${pr.c}`}>{pr.l}</span>
                    <button onClick={()=>remove(t.id)} className="text-slate-300 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                  </div>
                )
              })}
            </div>
        }
      </div>
    </div>
  )
}