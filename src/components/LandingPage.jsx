import { useState, useEffect, useRef } from "react"
import { useTheme } from "../context/ThemeContext"
import { ArrowRight, CheckCircle2, Flame, Star, Zap, Gift, BookOpen, Dumbbell, Palette, Layout, Timer, BarChart2, FolderOpen, ChevronDown, Shield, Users, TrendingUp, Lock } from "lucide-react"

const CATEGORIES = [
  { icon: BookOpen, label: "Études",           desc: "Devoirs, révisions, Pomodoro. Ne rate plus jamais une deadline.", color: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.2)" },
  { icon: Dumbbell, label: "Sport",             desc: "Séances, exercices, nutrition. Suis ta progression physique.",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)" },
  { icon: Palette,  label: "Projet créatif",   desc: "Idées, missions créatives, inspiration. Concrétise tes projets.", color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.2)" },
  { icon: Layout,   label: "Organisation",     desc: "Tâches, projets, outils. Garde le contrôle de ton quotidien.",   color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
]

const FEATURES = [
  { icon: Zap,        label: "Gamification XP",      desc: "Gagne des points, monte de niveau, maintiens ton streak quotidien." },
  { icon: Timer,      label: "Pomodoro intégré",      desc: "Sessions de travail chronométrées avec pauses intelligentes." },
  { icon: BarChart2,  label: "Stats & Calendrier",    desc: "Visualise ta progression sur les 30, 60 ou 90 derniers jours." },
  { icon: FolderOpen, label: "Fichiers & Ressources", desc: "Stocke tes fichiers et accède aux meilleures ressources par catégorie." },
]

const TESTIMONIALS = [
  { name: "Lucas M.",  role: "Étudiant en médecine",  text: "47 jours de streak. Je révise tous les soirs sans même y penser. Ça a changé ma façon de travailler.",   avatar: "L", color: "#6366f1", streak: 47 },
  { name: "Sarah K.",  role: "Graphiste freelance",    text: "Le système XP m'a totalement motivée. Je check l'app avant même mon café. 3 projets livrés ce mois.",      avatar: "S", color: "#a855f7", streak: 31 },
  { name: "Thomas R.", role: "Passionné de sport",     text: "3 mois de séances loguées. Les graphiques de progression c'est hyper satisfaisant. +12kg au deadlift.",     avatar: "T", color: "#3b82f6", streak: 89 },
]

const STEPS = [
  { num: "01", title: "Choisis ton objectif",    desc: "Études, sport, créatif ou organisation — l'app s'adapte à ton domaine.",     icon: "🎯" },
  { num: "02", title: "Check tes tâches du jour", desc: "Chaque jour, une liste pensée pour avancer. Coche, gagne des XP, progresse.", icon: "✅" },
  { num: "03", title: "Regarde ton streak monter", desc: "La progression devient visible. La motivation suit. L'habitude s'installe.",  icon: "🔥" },
]

const STATS = [
  { value: "15k+", label: "Utilisateurs actifs" },
  { value: "91%",  label: "Taux de rétention" },
  { value: "3.2M", label: "Tâches complétées" },
  { value: "4.9★", label: "Note moyenne" },
]

const FAQ = [
  { q: "Comment s'organiser quand on est étudiant ?",   a: "Trakova centralise tes devoirs, révisions et objectifs. Tu crées des tâches quotidiennes, suis ta progression et maintiens un streak de travail régulier." },
  { q: "Quelle est la meilleure app de productivité ?", a: "Trakova propose un essai gratuit de 7 jours sans carte bancaire avec toutes les fonctionnalités : suivi d'objectifs, gamification XP, calendrier et gestion de fichiers." },
  { q: "Comment suivre ses objectifs sportifs ?",       a: "Le mode Sport te permet de planifier tes séances avec des templates (Push/Pull/Legs, HIIT, Yoga), suivre ton volume et accéder à des ressources nutrition." },
  { q: "Peut-on gérer plusieurs objectifs ?",           a: "4 modes disponibles : Études, Sport, Projet créatif et Organisation. Chaque mode a ses propres outils adaptés à tes besoins spécifiques." },
  { q: "Comment rester motivé sur le long terme ?",    a: "Les streaks, points XP et badges de récompense créent une boucle de motivation. Plus tu travailles régulièrement, plus tu montes en niveau." },
  { q: "Y a-t-il un engagement ?",                      a: "Aucun engagement. Tu peux annuler à tout moment depuis les paramètres, sans frais ni pénalité. L'essai de 7 jours ne demande aucune carte bancaire." },
]

const RECENT_USERS = ["A","M","J","K","T","S","R","L"]

function Confetti({ items }) {
  return items.map(p => (
    <div key={p.id} className="confetti-particle" style={{ left: p.x, top: p.y, background: p.color, width: p.size, height: p.size, animationDelay: p.delay + "ms", borderRadius: p.round ? "50%" : "2px" }} />
  ))
}

function AnimatedCount({ target, suffix = "" }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      observer.disconnect()
      const num = parseFloat(target.replace(/[^0-9.]/g, ""))
      const steps = 40
      let i = 0
      const interval = setInterval(() => {
        i++
        setCount(Math.round((num * i) / steps * 10) / 10)
        if (i >= steps) clearInterval(interval)
      }, 30)
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  return <span ref={ref}>{count}{suffix}</span>
}

export default function LandingPage({ onGetStarted }) {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const [faqOpen, setFaqOpen] = useState(null)
  const videoRef = useRef(null)
  const [videoMuted, setVideoMuted] = useState(true)
  const [confetti, setConfetti] = useState([])
  const [recentJoined, setRecentJoined] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRecentJoined(true), 3500)
    return () => clearTimeout(t)
  }, [])

  const spawn = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const colors = ["#6366f1","#818cf8","#a5b4fc","#c7d2fe","#f472b6","#34d399","#fbbf24"]
    const items = Array.from({ length: 22 }, (_, i) => ({
      id: Date.now() + i, x: cx + (Math.random() - 0.5) * 140, y: cy + (Math.random() - 0.5) * 70,
      color: colors[i % colors.length], delay: Math.random() * 250, size: 6 + Math.random() * 6, round: Math.random() > 0.5,
    }))
    setConfetti(items)
    setTimeout(() => setConfetti([]), 1200)
    onGetStarted()
  }

  const bg      = isDark ? "#070710" : "#f4f4f9"
  const surface = isDark ? "#0e0e1c" : "#ffffff"
  const border  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"
  const text    = isDark ? "#ededf8" : "#16162a"
  const muted   = isDark ? "rgba(237,237,248,0.45)" : "rgba(22,22,42,0.5)"
  const faint   = isDark ? "rgba(237,237,248,0.2)" : "rgba(22,22,42,0.28)"

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: bg, color: text }}>
      <Confetti items={confetti} />

      {/* ── NAV ───────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: isDark ? "rgba(7,7,16,0.92)" : "rgba(244,244,249,0.97)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${border}` }}>
        <img src="/logo.svg" alt="Trakova" className="h-8 w-auto" />
        <div className="flex items-center gap-3">
          <button onClick={onGetStarted} className="text-sm transition-colors hidden sm:block" style={{ color: muted }}>Connexion</button>
          <button onClick={spawn} className="btn-primary text-xs px-4 py-2">Essai gratuit</button>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(${isDark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.07)"} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />

        <div className="relative max-w-3xl mx-auto fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", color: "#a5b4fc", letterSpacing: "0.02em" }}>
            <Flame size={11} /> ESSAI 7 JOURS GRATUIT · SANS CARTE BANCAIRE
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6" style={{ color: text, letterSpacing: "-0.03em" }}>
            Suis tes objectifs.<br />
            <span className="gradient-text">Construis tes habitudes.</span>
          </h1>

          <p className="text-xl font-semibold mb-10 max-w-xl mx-auto" style={{ color: text, letterSpacing: "-0.02em" }}>
            Trakova = to-do list&nbsp;
            <span style={{ color: "rgba(99,102,241,0.5)" }}>+</span>&nbsp;streak&nbsp;
            <span style={{ color: "rgba(99,102,241,0.5)" }}>+</span>&nbsp;XP&nbsp;
            <span style={{ color: "rgba(99,102,241,0.5)" }}>+</span>&nbsp;stats
          </p>

          {/* Social proof avatars */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex -space-x-2">
              {RECENT_USERS.map((u, i) => (
                <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2" style={{ background: `hsl(${i * 40 + 220},70%,55%)`, ringColor: bg }}>
                  {u}
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: muted }}>
              <span style={{ color: text, fontWeight: 600 }}>+15 000</span> personnes ont déjà rejoint
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button onClick={spawn} className="btn-primary flex items-center gap-2 text-sm px-7 py-3.5 w-full sm:w-auto justify-center">
              Commencer gratuitement <ArrowRight size={15} />
            </button>
            <button className="flex items-center gap-2 text-sm transition-colors" style={{ color: muted }} onClick={onGetStarted}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(99,102,241,0.1)", border: `1px solid ${border}` }}>
                <span className="text-xs ml-0.5">▶</span>
              </div>
              Voir la démo
            </button>
          </div>

          {/* Trust micro-copy */}
          <div className="flex items-center justify-center flex-wrap gap-4 text-xs" style={{ color: faint }}>
            <span className="flex items-center gap-1.5"><Shield size={11} /> Aucune carte requise</span>
            <span className="flex items-center gap-1.5"><Lock size={11} /> Annulable à tout moment</span>
            <span className="flex items-center gap-1.5"><Star size={11} fill="currentColor" /> Note 4.9/5</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-2xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((s, i) => (
            <div key={i} className="text-center py-4 px-3 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
              <p className="text-2xl font-bold gradient-text" style={{ letterSpacing: "-0.03em" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: faint }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO VIDEO ────────────────────────────────── */}
      <section className="px-4 py-8 max-w-4xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 24px 64px rgba(0,0,0,0.45)" }}>
          <video ref={videoRef} src="/demo.mp4" autoPlay muted loop playsInline disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback" onContextMenu={e => e.preventDefault()} className="w-full block" />
          <button onClick={() => { if (!videoRef.current) return; videoRef.current.muted = !videoRef.current.muted; if (!videoRef.current.muted) videoRef.current.volume = 0.33; setVideoMuted(videoRef.current.muted) }}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
            {videoMuted ? "🔇" : "🔊"}
          </button>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────── */}
      <section className="py-20 px-6" style={{ background: isDark ? "rgba(99,102,241,0.03)" : "rgba(99,102,241,0.03)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818cf8", letterSpacing: "0.12em" }}>COMMENT ÇA MARCHE</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: text }}>Opérationnel en 2 minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="relative text-center p-6 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-10 -right-3 text-2xl" style={{ color: "rgba(99,102,241,0.3)" }}>→</div>
                )}
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="text-xs font-bold mb-2" style={{ color: "#6366f1" }}>{s.num}</div>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: text }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: muted }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={onGetStarted} className="btn-primary flex items-center gap-2 mx-auto text-sm px-6 py-3">
              Essayer maintenant — c'est gratuit <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── 4 CATEGORIES ──────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818cf8", letterSpacing: "0.12em" }}>4 MODES</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: text }}>Un outil pour chaque objectif</h2>
            <p className="mt-3 max-w-md mx-auto text-sm" style={{ color: muted }}>Chaque mode est pensé pour son domaine. Onglets, catégories et outils adaptés.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((c, i) => {
              const Icon = c.icon
              return (
                <div key={i} className="rounded-2xl p-6 transition-all cursor-default group" style={{ background: surface, border: `1px solid ${border}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.2)` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = "none" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <Icon size={18} style={{ color: c.color }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: text, letterSpacing: "-0.02em" }}>{c.label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: muted }}>{c.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818cf8", letterSpacing: "0.12em" }}>FONCTIONNALITÉS</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: text }}>Tout ce dont tu as besoin</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <Icon size={16} style={{ color: "#818cf8" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: text }}>{f.label}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: muted }}>{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818cf8", letterSpacing: "0.12em" }}>TÉMOIGNAGES</p>
            <h2 className="text-3xl font-bold" style={{ color: text }}>Ils ont changé leurs habitudes</h2>
            <p className="text-sm mt-2" style={{ color: faint }}>Des vraies personnes, des vrais résultats</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-5 rounded-2xl flex flex-col" style={{ background: surface, border: `1px solid ${border}` }}>
                <div className="flex items-center gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#818cf8" style={{ color: "#818cf8" }} />)}
                </div>
                <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: muted }}>"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: t.color }}>{t.avatar}</div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: text }}>{t.name}</p>
                      <p className="text-xs" style={{ color: faint }}>{t.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)" }}>
                    <span className="text-xs">🔥</span>
                    <span className="text-xs font-bold" style={{ color: "#818cf8" }}>{t.streak}j</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818cf8", letterSpacing: "0.12em" }}>TARIFS</p>
            <h2 className="text-3xl font-bold" style={{ color: text }}>Simple et transparent</h2>
            <p className="text-sm mt-2" style={{ color: muted }}>Essai 7 jours, puis résilie quand tu veux</p>
          </div>

          <div className="rounded-2xl p-7" style={{ background: surface, border: "1px solid rgba(99,102,241,0.25)", boxShadow: "0 24px 64px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.05) inset" }}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm" style={{ color: muted }}>Accès complet</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }}>-40%</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold animate-pulse" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>Durée limitée</span>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl line-through" style={{ color: faint }}>10€</span>
                <span className="text-5xl font-bold gradient-text" style={{ letterSpacing: "-0.04em" }}>6€</span>
                <span className="text-sm mb-2" style={{ color: muted }}>/mois</span>
              </div>
              <p className="text-xs mt-1" style={{ color: faint }}>ou <span style={{ color: "#818cf8", fontWeight: 600 }}>64€/an</span> <span style={{ textDecoration: "line-through", opacity: 0.4 }}>72€</span> — économise 8€</p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-6" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.16)" }}>
              <Gift size={13} style={{ color: "#818cf8", flexShrink: 0 }} />
              <span className="text-xs" style={{ color: muted }}>7 jours gratuits — aucun débit immédiat</span>
            </div>

            <ul className="space-y-2.5 mb-7">
              {["4 modes : Études, Sport, Créatif, Organisation","Système XP, niveaux et streaks quotidiens","Devoirs, missions, fichiers illimités","Pomodoro et planning journalier intelligent","Statistiques et calendrier de progression","Toutes les futures fonctionnalités incluses"].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm" style={{ color: muted }}>
                  <CheckCircle2 size={14} style={{ color: "#6366f1", flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>

            <div className="space-y-2.5">
              <a href="/subscribe" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm">
                <Zap size={14} /> Commencer l'essai gratuit
              </a>
              <a href="/subscribe?plan=yearly" className="w-full flex items-center justify-center gap-2 py-3 text-sm rounded-xl transition-all" style={{ border: "1px solid rgba(99,102,241,0.28)", color: "#a5b4fc" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Choisir l'annuel — 64€/an
              </a>
            </div>

            {/* Trust signals sous le CTA */}
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <span className="flex items-center gap-1 text-xs" style={{ color: faint }}><Lock size={10} /> Paiement Stripe sécurisé</span>
              <span className="flex items-center gap-1 text-xs" style={{ color: faint }}><Shield size={10} /> Annulation instantanée</span>
              <span className="flex items-center gap-1 text-xs" style={{ color: faint }}><Users size={10} /> 15k+ utilisateurs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#818cf8", letterSpacing: "0.12em" }}>FAQ</p>
          <h2 className="text-2xl font-bold" style={{ color: text }}>Questions fréquentes</h2>
        </div>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-xl overflow-hidden transition-all" style={{ border: `1px solid ${faqOpen === i ? "rgba(99,102,241,0.25)" : border}`, background: surface }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <h3 className="text-sm font-medium pr-4" style={{ color: text }}>{item.q}</h3>
                <ChevronDown size={16} style={{ color: muted, flexShrink: 0, transform: faqOpen === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
              </button>
              {faqOpen === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm leading-relaxed" style={{ color: muted }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
          <div className="relative">
            <h2 className="text-4xl font-bold mb-4" style={{ color: text, letterSpacing: "-0.03em" }}>Prêt à passer<br />au niveau supérieur ?</h2>
            <p className="mb-8 text-sm" style={{ color: muted }}>Rejoins des milliers d'utilisateurs qui ont transformé leur quotidien.</p>
            <button onClick={spawn} className="btn-primary flex items-center gap-2 mx-auto text-sm px-7 py-3.5">
              Commencer gratuitement <ArrowRight size={15} />
            </button>
            <p className="text-xs mt-4" style={{ color: faint }}>7 jours gratuits · Puis 6€/mois · Annulable à tout moment</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="px-6 py-8" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo.svg" alt="Trakova" style={{ height: "28px", width: "auto" }} />
          <p className="text-xs" style={{ color: faint }}>© 2026 Trakova</p>
          <div className="flex items-center gap-5 text-xs" style={{ color: faint }}>
            <a href="/subscribe" className="hover:opacity-80 transition-opacity">Abonnement</a>
            <a href="/contact"   className="hover:opacity-80 transition-opacity">Contact</a>
            <a href="/cgu"       className="hover:opacity-80 transition-opacity">CGU</a>
            <a href="/privacy"   className="hover:opacity-80 transition-opacity">Confidentialité</a>
          </div>
        </div>
      </footer>

      {/* ── STICKY CTA MOBILE ─────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 pb-4 pt-3" style={{ background: isDark ? "rgba(7,7,16,0.97)" : "rgba(244,244,249,0.97)", backdropFilter: "blur(20px)", borderTop: `1px solid ${border}` }}>
        <button onClick={spawn} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm">
          Essai gratuit 7 jours — sans carte <ArrowRight size={14} />
        </button>
      </div>

      {/* ── NOTIFICATION SOCIALE ──────────────────────── */}
      {recentJoined && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl fade-up"
          style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 16px 48px rgba(0,0,0,0.3)", maxWidth: "280px" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: "#6366f1" }}>M</div>
          <div>
            <p className="text-xs font-semibold" style={{ color: text }}>Mehdi vient de rejoindre 🎉</p>
            <p className="text-xs" style={{ color: faint }}>Il y a 2 minutes · Mode Études</p>
          </div>
          <button onClick={() => setRecentJoined(false)} className="text-xs ml-1 flex-shrink-0" style={{ color: faint }}>✕</button>
        </div>
      )}
    </div>
  )
}
