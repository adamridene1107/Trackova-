import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { format, subDays } from "date-fns"
import { fr } from "date-fns/locale"

export default function ProfilePage() {
  const userId = window.location.pathname.split("/profile/")[1]
  const [profile, setProfile] = useState(null)
  const [goalData, setGoalData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      supabase.from("profiles").select("name, created_at").eq("id", userId).single(),
      supabase.from("goal_data").select("goal, streak, entries").eq("user_id", userId).single()
    ]).then(([{ data: p }, { data: g }]) => {
      setProfile(p); setGoalData(g); setLoading(false)
    })
  }, [userId])

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background:"#0A0A0F" }}><div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"/></div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center" style={{ background:"#0A0A0F" }}><p className="text-white/40">Profil introuvable.</p></div>

  const entries = goalData?.entries || {}
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
    const entry = entries[date] || {}
    const total = (entry.tasks||[]).filter(Boolean).length + (entry.freeTasks||[]).filter(t=>t.done).length + (entry.customTasks||[]).filter(t=>t.done).length
    return { date, total, label: format(subDays(new Date(), 6-i), "EEE", { locale: fr }) }
  })
  const totalTasks = Object.values(entries).reduce((a, e) => a + (e.tasks||[]).filter(Boolean).length + (e.freeTasks||[]).filter(t=>t.done).length, 0)
  const max = Math.max(...last7.map(d => d.total), 1)

  const GOAL_LABELS = { homework:"Études", sport:"Sport & Santé", creative:"Projet créatif", organization:"Organisation" }
  const GOAL_EMOJIS = { homework:"📚", sport:"⚡", creative:"🎨", organization:"🗂️" }

  return (
    <div className="min-h-screen p-6 max-w-sm mx-auto" style={{ background:"#0A0A0F" }}>
      <a href="/" className="inline-flex items-center gap-1.5 text-white/30 text-xs mb-8 hover:text-white/60 transition-colors">← Trakova</a>
      <div className="card text-center mb-4">
        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl" style={{ background:"linear-gradient(135deg,#8b5cf6,#6366f1)" }}>
          {profile.name?.[0]?.toUpperCase() || "?"}
        </div>
        <h1 className="text-white font-bold text-xl">{profile.name}</h1>
        <p className="text-white/40 text-xs mt-1">Membre depuis {format(new Date(profile.created_at), "MMMM yyyy", { locale: fr })}</p>
        {goalData?.goal && <p className="text-violet-400 text-sm mt-2">{GOAL_EMOJIS[goalData.goal]} {GOAL_LABELS[goalData.goal]}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label:"Streak", value:`${goalData?.streak||0}🔥` },
          { label:"Tâches", value:totalTasks },
          { label:"Jours actifs", value:Object.keys(entries).filter(d=>entries[d]?.tasks?.some(Boolean)).length },
        ].map(s => (
          <div key={s.label} className="card text-center py-3">
            <p className="text-white font-bold text-lg">{s.value}</p>
            <p className="text-white/40 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <p className="text-white/40 text-xs mb-3">7 derniers jours</p>
        <div className="flex items-end gap-1.5 h-12">
          {last7.map((d, i) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm" style={{ height:`${Math.max((d.total/max)*100,d.total>0?10:3)}%`, minHeight:d.total>0?"4px":"2px", background:d.total>0?"rgba(139,92,246,0.5)":"rgba(255,255,255,0.06)" }}/>
              <span className="text-white/30 text-[9px] capitalize">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-white/20 text-xs text-center mt-6">Profil partagé via <a href="/" className="text-violet-400">Trakova</a></p>
    </div>
  )
}