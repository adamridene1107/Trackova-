import { useMemo } from "react"
import { format, subDays } from "date-fns"
import { fr } from "date-fns/locale"

export default function WeekSummary({ data }) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
      const entry = data.entries?.[date] || {}
      const fixed = (entry.tasks || []).filter(Boolean).length
      const free = (entry.freeTasks || []).filter(t => t.done).length
      const custom = (entry.customTasks || []).filter(t => t.done).length
      const total = fixed + free + custom
      const label = format(subDays(new Date(), 6 - i), "EEE", { locale: fr })
      const isToday = date === format(new Date(), "yyyy-MM-dd")
      return { date, total, label, isToday }
    })
  }, [data.entries])

  const max = Math.max(...days.map(d => d.total), 1)
  const totalWeek = days.reduce((a, d) => a + d.total, 0)
  const activeDays = days.filter(d => d.total > 0).length

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white/70 text-sm font-semibold">Cette semaine</h3>
          <p className="text-white/30 text-xs mt-0.5">{totalWeek} tâches · {activeDays}/7 jours actifs</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-lg">{data.streak || 0}</p>
          <p className="text-white/30 text-xs">streak</p>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {days.map((d, i) => {
          const pct = d.total / max
          const height = Math.max(pct * 100, d.total > 0 ? 8 : 3)
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm bar-grow"
                style={{
                  height: `${height}%`,
                  minHeight: d.total > 0 ? "4px" : "2px",
                  background: d.isToday ? "#8b5cf6" : d.total > 0 ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)",
                  animationDelay: `${i * 60}ms`
                }} />
              <span className="text-white/30 text-[9px] capitalize">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}