import { useState, useCallback, useMemo, lazy, Suspense, useEffect } from "react"
import { useSupabaseData } from "./hooks/useSupabaseData"
import { useTheme } from "./context/ThemeContext"
import GoalSelector from "./components/GoalSelector"
const DailyCheck = lazy(() => import("./components/DailyCheck"))
import Missions from "./components/Missions"
const ProgressCalendar = lazy(() => import("./components/ProgressCalendar"))
const ProgressChart = lazy(() => import("./components/ProgressChart"))
const ExportPDF = lazy(() => import("./components/ExportPDF"))
import Notifications from "./components/Notifications"
import Resources from "./components/Resources"
import Devoirs from "./components/Devoirs"
const MesFichiers = lazy(() => import("./components/MesFichiers"))
const Gamification = lazy(() => import("./components/Gamification"))
import Seance from "./components/Seance"
const WeekSummary = lazy(() => import("./components/WeekSummary"))
const AmbientSound = lazy(() => import("./components/AmbientSound"))
const FocusMode = lazy(() => import("./components/FocusMode"))
const SettingsPage = lazy(() => import("./components/SettingsPage"))
const HistoryPage = lazy(() => import("./components/HistoryPage"))
const ReferralPage = lazy(() => import("./components/ReferralPage"))

const Onboarding = lazy(() => import("./components/Onboarding"))
import Idees from "./components/Idees"
import { useGamification } from "./hooks/useGamification"
import { getGoalById } from "./lib/goals"
import { parseISO, isToday, isPast } from "date-fns"

import { CheckSquare, Target, Calendar, BarChart2, BookOpen, ClipboardList, Settings, Flame, FolderOpen, Zap, LogOut, Dumbbell, Lightbulb, Apple, ListTodo, RefreshCw, Gift } from "lucide-react"

const TABS_BY_GOAL = {
  homework: [
    { id:"today",     label:"Aujourd'hui", icon:CheckSquare },
    { id:"devoirs",   label:"Devoirs",     icon:ClipboardList },
    { id:"missions",  label:"Missions",    icon:Target },
    { id:"resources", label:"Ressources",  icon:BookOpen },
    { id:"calendar",  label:"Calendrier",  icon:Calendar },
    { id:"stats",     label:"Stats",       icon:BarChart2 },
    { id:"fichiers",  label:"Fichiers",    icon:FolderOpen },
    { id:"xp",        label:"XP",          icon:Zap },
    { id:"history",   label:"Historique",  icon:Calendar },
    { id:"referral",  label:"Parrainage",  icon:Gift },
  ],
  sport: [
    { id:"seance",    label:"Séance",        icon:Dumbbell },
    { id:"missions",  label:"Entraînements", icon:Target },
    { id:"resources", label:"Nutrition",     icon:Apple },
    { id:"calendar",  label:"Calendrier",    icon:Calendar },
    { id:"stats",     label:"Stats",         icon:BarChart2 },
    { id:"fichiers",  label:"Fichiers",      icon:FolderOpen },
    { id:"xp",        label:"XP",            icon:Zap },
    { id:"history",   label:"Historique",  icon:Calendar },
    { id:"referral",  label:"Parrainage",  icon:Gift },
  ],
  creative: [
    { id:"today",     label:"Aujourd'hui", icon:CheckSquare },
    { id:"idees",     label:"Idées",        icon:Lightbulb },
    { id:"missions",  label:"Missions",     icon:Target },
    { id:"resources", label:"Inspiration",  icon:BookOpen },
    { id:"calendar",  label:"Calendrier",   icon:Calendar },
    { id:"stats",     label:"Stats",        icon:BarChart2 },
    { id:"fichiers",  label:"Fichiers",     icon:FolderOpen },
    { id:"xp",        label:"XP",           icon:Zap },
    { id:"history",   label:"Historique",  icon:Calendar },
    { id:"referral",  label:"Parrainage",  icon:Gift },
  ],
  organization: [
    { id:"today",     label:"Aujourd'hui", icon:CheckSquare },
    { id:"devoirs",   label:"Tâches",       icon:ListTodo },
    { id:"missions",  label:"Projets",      icon:Target },
    { id:"resources", label:"Outils",       icon:BookOpen },
    { id:"calendar",  label:"Calendrier",   icon:Calendar },
    { id:"stats",     label:"Stats",        icon:BarChart2 },
    { id:"fichiers",  label:"Fichiers",     icon:FolderOpen },
    { id:"xp",        label:"XP",           icon:Zap },
    { id:"history",   label:"Historique",  icon:Calendar },
    { id:"referral",  label:"Parrainage",  icon:Gift },
  ],
}

function ConfettiParticle({ x, y, color, delay, size, round }) {
  return (
    <div className="confetti-particle" style={{
      left: x, top: y, background: color, width: size, height: size,
      animationDelay: delay + "ms", borderRadius: round ? "50%" : "2px",
    }} />
  )
}

export default function App({ user, onLogout }) {
  const { theme } = useTheme()
  const { data, today, setGoal, resetGoal, getTodayEntry, updateEntry, toggleTask, updateMissions, updateNotifications, updateDevoirs, loading } = useSupabaseData(user?.id)
  const { g, onTaskComplete, onFocusComplete } = useGamification()
  const [tab, setTab] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showFocus, setShowFocus] = useState(false)
  const [giftMsg, setGiftMsg] = useState(null)
  const [giftSeen, setGiftSeen] = useState(false)
  const [confetti, setConfetti] = useState([])
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem("gt_onboarded") } catch { return false }
  })

  const spawnConfetti = useCallback(() => {
    const colors = ["#6366f1","#818cf8","#a5b4fc","#c7d2fe","#f472b6","#34d399","#fbbf24"]
    const cx = window.innerWidth / 2, cy = window.innerHeight / 3
    const items = Array.from({ length: 26 }, (_, i) => ({
      id: Date.now() + i,
      x: cx + (Math.random() - 0.5) * 200,
      y: cy + (Math.random() - 0.5) * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 300,
      size: 6 + Math.random() * 7,
      round: Math.random() > 0.5,
    }))
    setConfetti(items)
    setTimeout(() => setConfetti([]), 1400)
  }, [])

  useEffect(() => {
    if (!data?.settings?.freeUntil || giftSeen) return
    const key = "gift_seen_" + data.settings.freeUntil
    if (!localStorage.getItem(key)) {
      setGiftMsg(data.settings.giftedMonths || 1)
      setGiftSeen(true)
    }
  }, [data?.settings?.freeUntil, data?.settings?.giftedMonths])

  const handleTaskComplete = useCallback(() => {
    onTaskComplete?.()
    spawnConfetti()
  }, [onTaskComplete, spawnConfetti])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "var(--primary-dim)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(99,102,241,0.2)", borderTopColor: "#818cf8" }} />
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>
      </div>
    </div>
  )
  if (!data.goal) return <GoalSelector onSelect={setGoal} />

  const goal = getGoalById(data.goal)
  const tabs = TABS_BY_GOAL[data.goal] || TABS_BY_GOAL.homework
  const activeTab = tab && tabs.find(t => t.id === tab) ? tab : tabs[0].id
  const devoirsRaw = data.devoirs || []
  const urgentCount = devoirsRaw.filter(d => !d.done && d.date && (isToday(parseISO(d.date)) || isPast(parseISO(d.date)))).length
  const streakColor = data.streak >= 30 ? "#f59e0b" : data.streak >= 14 ? "#f97316" : data.streak >= 7 ? "#818cf8" : "rgba(99,102,241,0.6)"

  return (
    <div className="min-h-screen" style={{ background: theme === "light" ? "var(--bg)" : "#070710" }}>
      {confetti.map(p => <ConfettiParticle key={p.id} {...p} />)}

      {/* ─── Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-40"
        style={{
          background: theme === "light" ? "rgba(244,244,249,0.97)" : "rgba(7,7,16,0.96)",
          borderBottom: `1px solid ${theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}`,
          backdropFilter: "blur(20px)",
        }}>

        {/* Top bar */}
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Trakova" style={{ height: "48px", width: "auto" }} className="flex-shrink-0" />
            {data.streak > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)" }}>
                <span className="flame-anim text-xs">🔥</span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: streakColor }}>{data.streak}j</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <Suspense fallback={null}><ExportPDF data={data} /></Suspense>
            <button onClick={() => resetGoal()} className="btn-ghost" title="Changer d'objectif"><RefreshCw size={15} /></button>
            <button
              onClick={() => setShowFocus(true)}
              className="btn-ghost"
              title="Mode Focus"
              style={{ color: showFocus ? "#818cf8" : undefined }}>
              <Zap size={15} />
            </button>
            <button onClick={() => setShowSettings(true)} className="btn-ghost"><Settings size={15} /></button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav
          className="max-w-2xl mx-auto flex overflow-x-auto px-3 pb-2 gap-1 scrollbar-hide"
          style={{ cursor: "grab", WebkitOverflowScrolling: "touch" }}
          onMouseDown={e => {
            const el = e.currentTarget
            const startX = e.pageX - el.offsetLeft
            const scrollLeft = el.scrollLeft
            const onMove = mv => {
              if (Math.abs(mv.pageX - el.offsetLeft - startX) > 5) {
                el.style.cursor = "grabbing"
                el.scrollLeft = scrollLeft - (mv.pageX - el.offsetLeft - startX)
              }
            }
            const onUp = () => { el.style.cursor = "grab"; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
            window.addEventListener("mousemove", onMove)
            window.addEventListener("mouseup", onUp)
          }}>
          {tabs.map(t => {
            const Icon = t.icon
            const active = activeTab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`nav-tab ${active ? "active" : ""}`}>
                <Icon size={12} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split("'")[0].split(" ")[0]}</span>
                {t.id === "devoirs" && urgentCount > 0 && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold leading-none flex-shrink-0"
                    style={{ background: "#6366f1", color: "#fff" }}>
                    {urgentCount > 9 ? "9+" : urgentCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </header>

      {/* ─── Main content ────────────────────────────── */}
      <main className="max-w-2xl mx-auto p-4 pb-10">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(99,102,241,0.2)", borderTopColor: "#818cf8" }} />
          </div>
        }>
          <div className={activeTab === "today"        ? "tab-content" : "hidden"}><Suspense fallback={null}><WeekSummary data={data} /></Suspense><Suspense fallback={null}><AmbientSound /></Suspense><DailyCheck data={data} today={today} getTodayEntry={getTodayEntry} toggleTask={toggleTask} updateEntry={updateEntry} onTaskComplete={handleTaskComplete} onFocusComplete={onFocusComplete} showPomodoro={data.goal === "homework"} /></div>
          <div className={activeTab === "seance"       ? "tab-content" : "hidden"}><Seance data={data} updateEntry={updateEntry} getTodayEntry={getTodayEntry} /></div>
          <div className={activeTab === "idees"        ? "tab-content" : "hidden"}><Idees /></div>
          <div className={activeTab === "devoirs"      ? "tab-content" : "hidden"}><Devoirs devoirs={data.devoirs || []} updateDevoirs={updateDevoirs} goalId={data.goal} /></div>
          <div className={activeTab === "missions"     ? "tab-content" : "hidden"}><Missions data={data} updateMissions={updateMissions} /></div>
          <div className={activeTab === "resources"    ? "tab-content" : "hidden"}><Resources goalId={data.goal} /></div>
          <div className={activeTab === "calendar"     ? "tab-content" : "hidden"}><ProgressCalendar data={data} /></div>
          <div className={activeTab === "stats"        ? "tab-content" : "hidden"}><ProgressChart data={data} /></div>
          <div className={activeTab === "fichiers"     ? "tab-content" : "hidden"}><MesFichiers goalId={data.goal} /></div>
          <div className={activeTab === "xp"           ? "tab-content" : "hidden"}><Gamification /></div>
          <div className={activeTab === "history"      ? "tab-content" : "hidden"}><HistoryPage data={data} /></div>
          <div className={activeTab === "referral"     ? "tab-content" : "hidden"}><ReferralPage user={user} /></div>
        </Suspense>
      </main>

      {/* ─── Gift modal ──────────────────────────────── */}
      {giftMsg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(16px)" }}>
          <div className="w-full max-w-sm fade-up text-center" style={{ background: "var(--surface)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "1.5rem", padding: "2rem", boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.05) inset" }}>
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="text-white font-bold text-xl mb-2" style={{ letterSpacing: "-0.025em" }}>Cadeau reçu !</h2>
            <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Tu as reçu</p>
            <p className="font-bold text-3xl mb-1 gradient-text">{giftMsg} mois gratuit{giftMsg > 1 ? "s" : ""}</p>
            <p className="text-xs mb-6" style={{ color: "var(--text-faint)" }}>Profite de toutes les fonctionnalités sans frais !</p>
            <button onClick={() => { localStorage.setItem("gift_seen_" + data.settings.freeUntil, "1"); setGiftMsg(null) }} className="btn-primary w-full py-3 text-sm">
              Super, merci ! 🙌
            </button>
          </div>
        </div>
      )}

      {/* ─── Overlays ────────────────────────────────── */}
      {showFocus && (
        <Suspense fallback={null}>
          <FocusMode data={data} getTodayEntry={getTodayEntry} toggleTask={toggleTask} updateEntry={updateEntry} onClose={() => setShowFocus(false)} onFocusComplete={onFocusComplete} />
        </Suspense>
      )}
      {showOnboarding && (
        <Suspense fallback={null}>
          <Onboarding onDone={() => { localStorage.setItem("gt_onboarded", "1"); setShowOnboarding(false) }} />
        </Suspense>
      )}
      {showSettings && (
        <Suspense fallback={null}>
          <SettingsPage user={user} data={data} onLogout={onLogout} resetGoal={() => { resetGoal(); setShowSettings(false) }} onClose={() => setShowSettings(false)} />
        </Suspense>
      )}
    </div>
  )
}
