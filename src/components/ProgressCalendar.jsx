import Calendar from "react-calendar"
import { format } from "date-fns"
import { Flame, CheckCircle2, TrendingUp } from "lucide-react"

export default function ProgressCalendar({ data }) {
  const entries = data.entries || {}
  const total = Object.keys(entries).length
  const done = Object.values(entries).filter(e=>e.done).length
  const pct = total > 0 ? Math.round((done/total)*100) : 0

  const tileContent = ({ date }) => {
    const key = format(date, "yyyy-MM-dd")
    const e = entries[key]
    if (e?.done) return <span className="block text-center text-[10px] leading-none mt-0.5 opacity-70">✓</span>
    if (e?.tasks?.some(Boolean)) return <span className="block text-center text-[10px] leading-none mt-0.5 opacity-40">·</span>
    return null
  }

  return (
    <div className="space-y-3 fade-in">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Serie",      value:data.streak, unit:"j", icon:<Flame size={14} className="text-white/40"/> },
          { label:"Completes",  value:done,         unit:"j", icon:<CheckCircle2 size={14} className="text-white/40"/> },
          { label:"Regularite", value:pct,          unit:"%", icon:<TrendingUp size={14} className="text-white/40"/> },
        ].map(s=>(
          <div key={s.label} className="card text-center py-4">
            <div className="flex justify-center mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}<span className="text-sm text-white/50">{s.unit}</span></div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">Calendrier</h3>
        <Calendar tileContent={tileContent} locale="fr-FR" />
        <div className="flex gap-4 mt-4 text-xs text-white/40 border-t border-white/[0.06] pt-3">
          <span>✓ Jour complet</span>
          <span>· En cours</span>
        </div>
      </div>
    </div>
  )
}
