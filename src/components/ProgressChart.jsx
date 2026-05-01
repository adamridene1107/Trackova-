import { format, subDays, parseISO, isToday, isPast } from "date-fns"
import { fr } from "date-fns/locale"

const HUMEUR_MAP = { "😴":1, "😐":2, "🙂":3, "😄":4, "🔥":5 }
const HUMEUR_COLORS = { 1:"#4a4a4a", 2:"#6b6b6b", 3:"#8f8f8f", 4:"#c0c0c0", 5:"#ffffff" }

export default function ProgressChart({ data }) {
  const entries = data.entries || {}

  const last30 = Array.from({length:30},(_,i)=>{
    const d = subDays(new Date(), 29-i)
    const key = format(d,"yyyy-MM-dd")
    const e = entries[key]
    return { day: format(d,"d MMM",{locale:fr}), v: e?.done ? 1 : e?.tasks?.some(Boolean) ? 0.5 : 0 }
  })

  const last7Humeur = Array.from({length:7},(_,i)=>{
    const d = subDays(new Date(), 6-i)
    const key = format(d,"yyyy-MM-dd")
    const e = entries[key]
    const val = e?.humeur ? (HUMEUR_MAP[e.humeur] || 0) : 0
    return { day: format(d,"EEE",{locale:fr}), val, emoji: e?.humeur || "" }
  })

  const barColors = { 1:"rgba(255,255,255,0.75)", 0.5:"rgba(255,255,255,0.22)", 0:"rgba(255,255,255,0.05)" }
  const victories = Object.entries(entries).filter(([,e])=>e.victory).sort(([a],[b])=>b.localeCompare(a)).slice(0,8)

  let devoirsAll = []
  try { devoirsAll = JSON.parse(localStorage.getItem("goaltracker_devoirs") || "[]") } catch {}
  const devoirsDone = devoirsAll.filter(d => d.done).length
  const devoirsUrgent = devoirsAll.filter(d => !d.done && d.date && (isToday(parseISO(d.date)) || isPast(parseISO(d.date)))).length
  const devoirsTodo = devoirsAll.filter(d => !d.done).length

  const missions = data.missions || []
  const missionsDone = missions.filter(m => m.status === "done").length

  const todayKey = format(new Date(), "yyyy-MM-dd")
  const todayEntry = entries[todayKey] || {}
  const todayTotal =
    (todayEntry.tasks || []).filter(Boolean).length +
    (todayEntry.customTasks || []).filter(t => t.done).length +
    (todayEntry.freeTasks || []).filter(t => t.done).length

  return (
    <div className="space-y-3 fade-in">

      {/* Résumé du jour */}
      <div className="card">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">
          {format(new Date(), "EEEE d MMMM", { locale: fr })}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.07] rounded-xl p-3">
            <p className="text-white/50 text-xs mb-1">Taches faites</p>
            <p className="text-2xl font-bold text-white">{todayTotal}</p>
          </div>
          <div className="bg-white/[0.07] rounded-xl p-3">
            <p className="text-white/50 text-xs mb-1">Humeur</p>
            <p className="text-2xl">{todayEntry.humeur || "—"}</p>
          </div>
          <div className="bg-white/[0.07] rounded-xl p-3">
            <p className="text-white/50 text-xs mb-1">Devoirs a faire</p>
            <p className="text-2xl font-bold text-white">{devoirsTodo}</p>
          </div>
          <div className={`rounded-xl p-3 ${devoirsUrgent > 0 ? "bg-red-500/10" : "bg-white/[0.07]"}`}>
            <p className="text-white/50 text-xs mb-1">Urgents</p>
            <p className={`text-2xl font-bold ${devoirsUrgent > 0 ? "text-red-400" : "text-white"}`}>
              {devoirsUrgent > 0 ? `⚠ ${devoirsUrgent}` : "0"}
            </p>
          </div>
        </div>
      </div>

      {/* Compteurs globaux */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Streak", value:`${data.streak || 0}j` },
          { label:"Devoirs", value:devoirsDone },
          { label:"Missions", value:missionsDone },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Humeur 7 jours */}
      <div className="card">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Humeur — 7 jours</p>
        <div className="flex justify-around items-end gap-1 h-16">
          {last7Humeur.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-sm">{d.emoji || ""}</span>
              <div className="w-full rounded-t transition-all duration-500"
                style={{
                  height: `${d.val > 0 ? d.val * 8 + 4 : 3}px`,
                  background: d.val > 0 ? HUMEUR_COLORS[d.val] : "rgba(255,255,255,0.05)"
                }} />
              <span className="text-[10px] text-white/40 capitalize">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Régularité 30 jours */}
      <div className="card">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Régularité — 30 jours</p>
        <div className="flex items-end gap-0.5 h-20" title="Chaque barre = 1 jour">
          {last30.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1 h-full justify-end group relative">
              <div className="w-full rounded-t transition-all duration-300"
                style={{
                  height: d.v === 1 ? "100%" : d.v === 0.5 ? "55%" : "8%",
                  background: barColors[d.v],
                }}
              />
              {/* Tooltip au hover */}
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-black/80 text-white/70 px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {d.day} · {d.v === 1 ? "✅" : d.v === 0.5 ? "〜" : "—"}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-white/20">{last30[0]?.day}</span>
          <span className="text-[10px] text-white/20">{last30[29]?.day}</span>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          {[["rgba(255,255,255,0.75)","Complet"],["rgba(255,255,255,0.22)","Partiel"],["rgba(255,255,255,0.05)","Non fait"]].map(([c,l])=>(
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background:c }} />
              <span className="text-[10px] text-white/30">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Victoires */}
      <div className="card">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Victoires recentes</p>
        {victories.length === 0
          ? <p className="text-white/40 text-sm text-center py-6">Aucune victoire enregistree.</p>
          : <div className="space-y-3">
              {victories.map(([date,e])=>(
                <div key={date} className="flex gap-3 items-start">
                  <span className="text-white/40 text-sm flex-shrink-0">🏆</span>
                  <div>
                    <p className="text-white/40 text-xs">{date}</p>
                    <p className="text-white/60 text-sm mt-0.5">{e.victory}</p>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
