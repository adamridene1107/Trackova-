import { useState, useCallback, useMemo, lazy, Suspense, useEffect, Component } from "react"
import { useGoalData } from "./context/GoalDataContext"
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

import Idees from "./components/Idees"
import PlanningHebdo from "./components/PlanningHebdo"
import { useGamification } from "./hooks/useGamification"
import { getGoalById } from "./lib/goals"
import { parseISO, isToday, isPast } from "date-fns"
import { initNotifications } from "./lib/notifications"

import { CheckSquare, Target, Calendar, BarChart2, BookOpen, ClipboardList, Settings, FolderOpen, Zap, Dumbbell, Lightbulb, Apple, ListTodo, RefreshCw, Gift, Lock, Sparkles, X } from "lucide-react"
import { computeIsPremium, LOCKED_TABS, FREE_LIMITS } from "./lib/plan"

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error("🔴 Crash React:", error.message, info?.componentStack?.slice(0, 300))
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, background: "#0A0A0F", minHeight: "100vh", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h2 style={{ color: "#f87171", fontWeight: 700, fontSize: 18, margin: 0 }}>Une erreur s'est produite</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0, maxWidth: 420, textAlign: "center" }}>
            {this.state.error?.message || "Erreur inconnue"}
          </p>
          <code style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 14px", fontSize: 11, color: "#a78bfa", maxWidth: 420, overflowX: "auto" }}>
            {this.state.error?.stack?.slice(0, 500)}
          </code>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: 8, padding: "10px 22px", background: "#6366f1", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
            Recharger
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

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
    { id:"history",   label:"Historique",    icon:Calendar },
    { id:"referral",  label:"Parrainage",    icon:Gift },
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
    { id:"history",   label:"Historique",   icon:Calendar },
    { id:"referral",  label:"Parrainage",   icon:Gift },
  ],
  organization: [
    { id:"today",     label:"Aujourd'hui", icon:CheckSquare },
    { id:"devoirs",   label:"Tâches",       icon:ListTodo },
    { id:"planning",  label:"Planning",     icon:Calendar },
    { id:"missions",  label:"Projets",      icon:Target },
    { id:"resources", label:"Outils",       icon:BookOpen },
    { id:"stats",     label:"Stats",        icon:BarChart2 },
    { id:"fichiers",  label:"Fichiers",     icon:FolderOpen },
    { id:"xp",        label:"XP",           icon:Zap },
    { id:"history",   label:"Historique",   icon:Calendar },
    { id:"referral",  label:"Parrainage",   icon:Gift },
  ],
}

// Descriptions lisibles des features bloquées
const LOCKED_DESCRIPTIONS = {
  planning:  "Planning hebdo Google Calendar",
  fichiers:  "Stockage de fichiers illimité",
  xp:        "Système XP, niveaux et badges",
  stats:     "Statistiques avancées",
  history:   "Historique complet",
  referral:  "Programme de parrainage",
  calendar:  "Calendrier de progression",
  resources: "Ressources & contenus",
  seance:    "Suivi de séances",
  idees:     "Carnet d'idées",
  focus:     "Mode Focus & concentration",
  missions:  "Missions illimitées",
}

function ConfettiParticle({ x, y, color, delay, size, round }) {
  return (
    <div className="confetti-particle" style={{
      left: x, top: y, background: color, width: size, height: size,
      animationDelay: delay + "ms", borderRadius: round ? "50%" : "2px",
    }} />
  )
}

// ─── Modal Upsell ─────────────────────────────────────────────────────────────
function UpsellModal({ feature, onClose }) {
  const desc = LOCKED_DESCRIPTIONS[feature] || "cette fonctionnalité"
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm fade-up" style={{
        background: "var(--surface)",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: "1.5rem",
        padding: "1.75rem",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset",
      }}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <Lock size={18} style={{ color: "#a78bfa" }} />
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5" style={{ color: "var(--text-faint)" }}>
            <X size={16} />
          </button>
        </div>

        <h2 className="font-bold text-lg mb-1" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
          Fonctionnalité Pro 🔒
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
          <span style={{ color: "#a78bfa", fontWeight: 600 }}>{desc}</span> est disponible dans le plan Pro.
        </p>

        {/* Ce que le Pro débloque */}
        <div className="space-y-2 mb-5">
          {[
            "Planning hebdo Google Calendar",
            "Stats avancées & historique",
            "Fichiers illimités",
            "Système XP & niveaux",
            "Tâches & missions illimitées",
            "Toutes les futures features",
          ].map(f => (
            <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="text-xs" style={{ color: "#34d399" }}>✓</span>
              {f}
            </div>
          ))}
        </div>

        <a href="/subscribe"
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm mb-2">
          <Sparkles size={14} /> Passer au Pro — 6€/mois
        </a>
        <button onClick={onClose} className="w-full text-xs py-2"
          style={{ color: "var(--text-faint)" }}>
          Continuer en gratuit
        </button>
      </div>
    </div>
  )
}

export default function App({ user, onLogout }) {
  const { theme } = useTheme()
  const { data, today, setGoal, resetGoal, getTodayEntry, updateEntry, toggleTask, updateMissions, updateNotifications, updateDevoirs, updateWeekPlan, loading } = useGoalData()
  const { g, onTaskComplete, onFocusComplete } = useGamification()
  const [tab, setTab] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showFocus, setShowFocus] = useState(false)
  const [giftMsg, setGiftMsg] = useState(null)
  const [giftSeen, setGiftSeen] = useState(false)
  const [confetti, setConfetti] = useState([])
  const [upsellFeature, setUpsellFeature] = useState(null)
  // Onboarding supprimé — accès direct au dashboard

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

  useEffect(() => { initNotifications() }, [])

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

  const isPremium = computeIsPremium(data.settings)

  // Gestion du clic sur un onglet : bloque si locked + free
  const handleTabClick = useCallback((tabId) => {
    if (!isPremium && LOCKED_TABS.has(tabId)) {
      setUpsellFeature(tabId)
    } else {
      setTab(tabId)
    }
  }, [isPremium])

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
    <ErrorBoundary>
    <div className="min-h-screen relative" style={{ background: theme === "light" ? "var(--bg)" : "#070710" }}>
      {confetti.map(p => <ConfettiParticle key={p.id} {...p} />)}

      {/* Ambient orbs background */}
      {theme !== "light" && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
          <div className="mesh-orb" style={{ width: 500, height: 500, top: "-15%", left: "-10%", background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)", animation: "meshFloat1 20s ease-in-out infinite" }} />
          <div className="mesh-orb" style={{ width: 400, height: 400, bottom: "-10%", right: "-10%", background: "radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)", animation: "meshFloat2 26s ease-in-out infinite" }} />
        </div>
      )}

      {/* ─── Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass-nav"
        style={{
          background: theme === "light" ? "rgba(244,244,249,0.65)" : "rgba(7,7,16,0.55)",
          borderBottom: `1px solid ${theme === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}`,
        }}>

        {/* Top bar */}
        <div className="max-w-2xl mx-auto flex items-center justify-between px-3 sm:px-4 pt-2 sm:pt-3.5 pb-1.5 sm:pb-2.5">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Trakova"
              style={{ height: "72px", width: "auto" }}
              className="flex-shrink-0 sm:h-24" />
            {data.streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)" }}>
                <span className="flame-anim text-xs">🔥</span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: streakColor }}>{data.streak}j</span>
              </div>
            )}
            {/* Badge plan */}
            {!isPremium && (
              <a href="/subscribe"
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}>
                Gratuit
              </a>
            )}
          </div>
          <div className="flex items-center gap-0">
            {isPremium && <Suspense fallback={null}><ExportPDF data={data} /></Suspense>}
            <button onClick={() => { if (window.confirm("Changer d'objectif ? Tes données actuelles seront conservées.")) resetGoal() }} className="btn-ghost" title="Changer d'objectif"><RefreshCw size={14} /></button>
            <button
              onClick={() => isPremium ? setShowFocus(true) : setUpsellFeature("focus")}
              className="btn-ghost"
              title={isPremium ? "Mode Focus" : "Mode Focus (Pro)"}
              style={{ color: showFocus ? "#818cf8" : !isPremium ? "rgba(251,191,36,0.5)" : undefined }}>
              <Zap size={14} />
            </button>
            <button onClick={() => setShowSettings(true)} className="btn-ghost"><Settings size={14} /></button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav
          className="max-w-2xl mx-auto flex overflow-x-auto px-2 sm:px-3 pb-2 gap-0.5 sm:gap-1"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {tabs.map(t => {
            const Icon = t.icon
            const active = activeTab === t.id
            const locked = !isPremium && LOCKED_TABS.has(t.id)
            return (
              <button key={t.id} onClick={() => handleTabClick(t.id)}
                className={`nav-tab flex-shrink-0 ${active ? "active" : ""} ${locked ? "opacity-50" : ""}`}>
                {locked
                  ? <Lock size={12} style={{ color: "#fbbf24" }} />
                  : <Icon size={13} />}
                <span className="text-[11px] sm:text-xs">{t.label}</span>
                {t.id === "devoirs" && urgentCount > 0 && !locked && (
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
      <main className="max-w-2xl mx-auto p-4 pb-10 relative z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(99,102,241,0.2)", borderTopColor: "#818cf8" }} />
          </div>
        }>
          <div className={activeTab === "today"        ? "tab-content" : "hidden"}>
            {isPremium && <Suspense fallback={null}><WeekSummary data={data} /></Suspense>}
            {isPremium && <Suspense fallback={null}><AmbientSound /></Suspense>}
            <DailyCheck data={data} today={today} getTodayEntry={getTodayEntry} toggleTask={toggleTask} updateEntry={updateEntry} updateDevoirs={updateDevoirs} onTaskComplete={handleTaskComplete} onFocusComplete={onFocusComplete} showPomodoro={data.goal === "homework"} isPremium={isPremium} freeLimits={FREE_LIMITS} />
          </div>
          {/* Onglets locked : ne pas charger si free (évite crash des libs) */}
          <div className={activeTab === "seance"       ? "tab-content" : "hidden"}>{isPremium && <Seance data={data} updateEntry={updateEntry} getTodayEntry={getTodayEntry} />}</div>
          <div className={activeTab === "idees"        ? "tab-content" : "hidden"}>{isPremium && <Idees />}</div>
          <div className={activeTab === "devoirs"      ? "tab-content" : "hidden"}><Devoirs devoirs={data.devoirs || []} updateDevoirs={updateDevoirs} goalId={data.goal} isPremium={isPremium} freeLimits={FREE_LIMITS} /></div>
          <div className={activeTab === "planning"     ? "tab-content" : "hidden"}>{isPremium && <PlanningHebdo weekPlan={data.weekPlan || {}} updateWeekPlan={updateWeekPlan} />}</div>
          <div className={activeTab === "missions"     ? "tab-content" : "hidden"}><Missions data={data} updateMissions={updateMissions} isPremium={isPremium} freeLimits={FREE_LIMITS} onUpsell={() => setUpsellFeature("missions")} /></div>
          <div className={activeTab === "resources"    ? "tab-content" : "hidden"}>{isPremium && <Resources goalId={data.goal} />}</div>
          <div className={activeTab === "calendar"     ? "tab-content" : "hidden"}>{isPremium && <ProgressCalendar data={data} />}</div>
          <div className={activeTab === "stats"        ? "tab-content" : "hidden"}>{isPremium && <ProgressChart data={data} />}</div>
          <div className={activeTab === "fichiers"     ? "tab-content" : "hidden"}>{isPremium && <MesFichiers goalId={data.goal} />}</div>
          <div className={activeTab === "xp"           ? "tab-content" : "hidden"}>{isPremium && <Gamification />}</div>
          <div className={activeTab === "history"      ? "tab-content" : "hidden"}>{isPremium && <HistoryPage data={data} />}</div>
          <div className={activeTab === "referral"     ? "tab-content" : "hidden"}>{isPremium && <ReferralPage user={user} />}</div>
        </Suspense>
      </main>

      {/* ─── Upsell modal ────────────────────────────── */}
      {upsellFeature && (
        <UpsellModal feature={upsellFeature} onClose={() => setUpsellFeature(null)} />
      )}

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
      {showSettings && (
        <Suspense fallback={null}>
          <SettingsPage user={user} data={data} onLogout={onLogout} resetGoal={() => { resetGoal(); setShowSettings(false) }} onClose={() => setShowSettings(false)} />
        </Suspense>
      )}
    </div>
    </ErrorBoundary>
  )
}
