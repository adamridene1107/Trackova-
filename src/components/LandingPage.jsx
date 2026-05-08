import { useState, useRef } from "react"
import { useTheme } from "../context/ThemeContext"
import { ArrowRight, CheckCircle2, Flame, Zap, Gift, BookOpen, Dumbbell, Palette, Layout, Timer, BarChart2, FolderOpen, ChevronDown, Shield, Lock, Check } from "lucide-react"

const CATEGORIES = [
  { icon: BookOpen, label: "Études",         desc: "Devoirs, révisions, Pomodoro. Ne rate plus jamais une deadline.", color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.16)" },
  { icon: Dumbbell, label: "Sport",           desc: "Séances, exercices, nutrition. Suis ta progression physique.",   color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.16)" },
  { icon: Palette,  label: "Projet créatif", desc: "Idées, missions créatives, inspiration. Concrétise tes projets.", color: "#a855f7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.16)" },
  { icon: Layout,   label: "Organisation",   desc: "Tâches, projets, outils. Garde le contrôle de ton quotidien.",   color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.16)" },
]

const FEATURES = [
  { icon: Zap,        label: "Gamification XP",      desc: "Gagne des points, monte de niveau, maintiens ton streak quotidien." },
  { icon: Timer,      label: "Pomodoro intégré",      desc: "Sessions de travail chronométrées avec pauses intelligentes." },
  { icon: BarChart2,  label: "Stats & Calendrier",    desc: "Visualise ta progression sur les 30, 60 ou 90 derniers jours." },
  { icon: FolderOpen, label: "Fichiers & Ressources", desc: "Stocke tes fichiers et accède aux meilleures ressources par catégorie." },
]

const STEPS = [
  { num: "01", title: "Choisis ton objectif",      desc: "Études, sport, créatif ou organisation — l'app s'adapte à ton domaine.",    icon: "🎯" },
  { num: "02", title: "Check tes tâches du jour",  desc: "Chaque jour, une liste pensée pour avancer. Coche, gagne des XP, progresse.", icon: "✅" },
  { num: "03", title: "Regarde ton streak monter", desc: "La progression devient visible. La motivation suit. L'habitude s'installe.", icon: "🔥" },
]

const FAQ = [
  { q: "Comment s'organiser quand on est étudiant ?",   a: "Trakova centralise tes devoirs, révisions et objectifs. Tu crées des tâches quotidiennes, suis ta progression et maintiens un streak de travail régulier." },
  { q: "Quelle est la meilleure app de productivité ?", a: "Trakova propose un essai gratuit de 7 jours sans carte bancaire avec toutes les fonctionnalités : suivi d'objectifs, gamification XP, calendrier et gestion de fichiers." },
  { q: "Comment suivre ses objectifs sportifs ?",       a: "Le mode Sport te permet de planifier tes séances avec des templates (Push/Pull/Legs, HIIT, Yoga), suivre ton volume et accéder à des ressources nutrition." },
  { q: "Peut-on gérer plusieurs objectifs ?",           a: "4 modes disponibles : Études, Sport, Projet créatif et Organisation. Chaque mode a ses propres outils adaptés à tes besoins spécifiques." },
  { q: "Comment rester motivé sur le long terme ?",     a: "Les streaks, points XP et badges de récompense créent une boucle de motivation. Plus tu travailles régulièrement, plus tu montes en niveau." },
  { q: "Y a-t-il un engagement ?",                      a: "Aucun engagement. Tu peux annuler à tout moment depuis les paramètres, sans frais ni pénalité. L'essai de 7 jours ne demande aucune carte bancaire." },
]

function Confetti({ items }) {
  return items.map(p => (
    <div key={p.id} className="confetti-particle"
      style={{ left: p.x, top: p.y, background: p.color, width: p.size, height: p.size, animationDelay: p.delay + "ms", borderRadius: p.round ? "50%" : "2px" }} />
  ))
}

export default function LandingPage({ onGetStarted }) {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const [faqOpen, setFaqOpen] = useState(null)
  const videoRef = useRef(null)
  const [videoMuted, setVideoMuted] = useState(true)
  const [confetti, setConfetti] = useState([])

  const spawn = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const colors = ["#6366f1","#818cf8","#a5b4fc","#f472b6","#34d399","#fbbf24","#c7d2fe"]
    const items = Array.from({ length: 22 }, (_, i) => ({
      id: Date.now() + i, x: cx + (Math.random() - 0.5) * 160, y: cy + (Math.random() - 0.5) * 80,
      color: colors[i % colors.length], delay: Math.random() * 280, size: 5 + Math.random() * 6, round: Math.random() > 0.5,
    }))
    setConfetti(items)
    setTimeout(() => setConfetti([]), 1300)
    onGetStarted()
  }

  const bg      = isDark ? "#080809"                 : "#F5F5F7"
  const surface = isDark ? "#0E0E11"                 : "#ffffff"
  const border  = isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.07)"
  const text    = isDark ? "#F8F8FA"                 : "#111118"
  const muted   = isDark ? "rgba(248,248,250,0.42)"  : "rgba(17,17,24,0.48)"
  const faint   = isDark ? "rgba(248,248,250,0.2)"   : "rgba(17,17,24,0.28)"
  const accent  = "#a5b4fc"

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: bg, color: text }}>
      <Confetti items={confetti} />

      {/* ── NAV ─────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <img src="/logo.svg" alt="Trakova" className="h-12 w-auto" />
          <div className="flex items-center gap-3">
            <button onClick={onGetStarted} className="text-sm hidden sm:block transition-opacity hover:opacity-80"
              style={{ color: muted }}>Connexion</button>
            <button onClick={spawn} className="btn-primary text-xs px-4 py-2">Essai gratuit</button>
          </div>
        </div>
      </nav>

      {/* ── HERO SPLIT ──────────────────────────── */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">

          {/* Left — texte */}
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8 text-xs font-medium"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: accent }}>
              <Flame size={10} /> 7 JOURS GRATUITS · SANS CARTE BANCAIRE
            </div>

            <h1 style={{ color: text, fontSize: "clamp(2.6rem, 5vw, 4.5rem)", letterSpacing: "-0.04em", lineHeight: 1.05, fontWeight: 800, marginBottom: "1.5rem" }}>
              Suis tes objectifs.<br />
              <span style={{ color: accent }}>Construis tes habitudes.</span>
            </h1>

            <p className="text-lg mb-8 leading-relaxed max-w-md" style={{ color: muted }}>
              Un seul outil pour tracker tes objectifs, gamifier ta progression et construire des habitudes durables.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <button onClick={spawn}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-sm">
                Commencer gratuitement <ArrowRight size={14} />
              </button>
              <button onClick={onGetStarted}
                className="flex items-center gap-2 px-5 py-3 text-sm rounded-lg transition-all"
                style={{ border: `1px solid ${border}`, color: muted }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; e.currentTarget.style.color = text }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted }}>
                <span style={{ fontSize: 11 }}>▶</span> Voir la démo
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-5 text-xs" style={{ color: faint }}>
              <span className="flex items-center gap-1.5"><Shield size={11} /> Aucune carte requise</span>
              <span className="flex items-center gap-1.5"><Lock size={11} /> Annulable à tout moment</span>
            </div>
          </div>

          {/* Right — vidéo */}
          <div className="fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative rounded-xl overflow-hidden"
              style={{ border: `1px solid ${border}`, background: surface }}>
              <video ref={videoRef} src="/demo.mp4" autoPlay muted loop playsInline disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                onContextMenu={e => e.preventDefault()} className="w-full block" />
              <button
                onClick={() => {
                  if (!videoRef.current) return
                  videoRef.current.muted = !videoRef.current.muted
                  if (!videoRef.current.muted) videoRef.current.volume = 0.33
                  setVideoMuted(videoRef.current.muted)
                }}
                className="absolute bottom-3 right-3 w-7 h-7 rounded-md flex items-center justify-center text-xs transition-opacity hover:opacity-80"
                style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {videoMuted ? "🔇" : "🔊"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 MODES ─────────────────────────────── */}
      <section className="py-20 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: accent, letterSpacing: "0.1em" }}>4 MODES</p>
            <h2 className="text-3xl sm:text-5xl font-bold" style={{ color: text }}>
              Un outil pour<br className="hidden sm:block" /> chaque objectif
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger">
            {CATEGORIES.map((c, i) => {
              const Icon = c.icon
              return (
                <div key={i} className="p-5 rounded-lg cursor-default transition-all"
                  style={{ background: surface, border: `1px solid ${border}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.background = isDark ? "#141417" : "#f8f8fc" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = surface }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <Icon size={16} style={{ color: c.color }} />
                  </div>
                  <h3 className="font-semibold mb-1.5 text-sm" style={{ color: text }}>{c.label}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: muted }}>{c.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ───────────────────── */}
      <section className="py-20 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: accent, letterSpacing: "0.1em" }}>COMMENT ÇA MARCHE</p>
            <h2 className="text-3xl sm:text-5xl font-bold" style={{ color: text }}>Opérationnel en 2 minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger">
            {STEPS.map((s, i) => (
              <div key={i} className="relative">
                <div className="text-4xl mb-5">{s.icon}</div>
                <div className="text-xs font-semibold mb-2" style={{ color: accent }}>{s.num}</div>
                <h3 className="font-semibold mb-2" style={{ color: text }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: muted }}>{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-5 -right-3 text-sm" style={{ color: border }}>→</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-12">
            <button onClick={onGetStarted} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
              Essayer maintenant <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ─────────────────────── */}
      <section className="py-20 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: accent, letterSpacing: "0.1em" }}>FONCTIONNALITÉS</p>
            <h2 className="text-3xl sm:text-5xl font-bold" style={{ color: text }}>Tout ce dont tu as besoin</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="p-5 rounded-lg"
                  style={{ background: surface, border: `1px solid ${border}` }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.14)" }}>
                    <Icon size={15} style={{ color: accent }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5" style={{ color: text }}>{f.label}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: muted }}>{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────── */}
      <section className="py-20 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: accent, letterSpacing: "0.1em" }}>TARIFS</p>
            <h2 className="text-3xl sm:text-5xl font-bold" style={{ color: text }}>Simple et transparent</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
            {/* Card premium */}
            <div className="rounded-lg p-7" style={{ background: surface, border: `1px solid rgba(99,102,241,0.22)` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>Pro</span>
                <span className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{ background: "rgba(16,185,129,0.08)", color: "#34d399", border: "1px solid rgba(16,185,129,0.16)" }}>-40% lancement</span>
              </div>
              <div className="flex items-end gap-2 my-4">
                <span className="text-lg line-through" style={{ color: faint }}>10€</span>
                <span className="text-5xl font-bold" style={{ color: text, letterSpacing: "-0.04em" }}>6€</span>
                <span className="text-sm mb-1" style={{ color: muted }}>/mois</span>
              </div>
              <p className="text-xs mb-6" style={{ color: faint }}>
                ou <span style={{ color: accent, fontWeight: 600 }}>64€/an</span>{" "}
                <span style={{ textDecoration: "line-through", opacity: 0.4 }}>72€</span>
              </p>

              <ul className="space-y-2.5 mb-7">
                {[
                  "4 modes : Études, Sport, Créatif, Organisation",
                  "Système XP, niveaux et streaks",
                  "Devoirs, missions, fichiers illimités",
                  "Pomodoro & planning journalier",
                  "Statistiques et calendrier",
                  "Toutes les futures fonctionnalités",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs" style={{ color: muted }}>
                    <Check size={12} style={{ color: "#6366f1", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <a href="/subscribe" className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm">
                <Zap size={13} /> Commencer l'essai gratuit
              </a>
              <p className="text-center text-xs mt-3" style={{ color: faint }}>7 jours gratuits · Aucun débit</p>
            </div>

            {/* Card annuel + trust */}
            <div className="flex flex-col gap-4">
              <div className="rounded-lg p-7 flex-1" style={{ background: surface, border: `1px solid ${border}` }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: muted }}>Annuel</div>
                <div className="flex items-end gap-2 my-4">
                  <span className="text-lg line-through" style={{ color: faint }}>72€</span>
                  <span className="text-5xl font-bold" style={{ color: text, letterSpacing: "-0.04em" }}>64€</span>
                  <span className="text-sm mb-1" style={{ color: muted }}>/an</span>
                </div>
                <p className="text-xs mb-6" style={{ color: faint }}>Économise 8€ par rapport au mensuel</p>
                <a href="/subscribe?plan=yearly"
                  className="w-full flex items-center justify-center py-2.5 text-sm rounded-lg transition-all"
                  style={{ border: `1px solid ${border}`, color: muted }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = text }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = muted }}>
                  Choisir l'annuel
                </a>
              </div>

              <div className="rounded-lg p-5 space-y-3" style={{ background: surface, border: `1px solid ${border}` }}>
                <div className="flex items-center gap-2.5 text-xs" style={{ color: muted }}>
                  <Gift size={13} style={{ color: accent }} />
                  7 jours d'essai gratuit · aucun débit
                </div>
                <div className="flex items-center gap-2.5 text-xs" style={{ color: muted }}>
                  <Lock size={13} style={{ color: accent }} />
                  Paiement sécurisé par Stripe
                </div>
                <div className="flex items-center gap-2.5 text-xs" style={{ color: muted }}>
                  <Shield size={13} style={{ color: accent }} />
                  Annulation instantanée, sans condition
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────── */}
      <section className="py-20 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: accent, letterSpacing: "0.1em" }}>FAQ</p>
            <h2 className="text-3xl sm:text-5xl font-bold" style={{ color: text }}>Questions fréquentes</h2>
          </div>
          <div className="space-y-1">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-lg overflow-hidden transition-colors"
                style={{ border: `1px solid ${faqOpen === i ? "rgba(99,102,241,0.2)" : border}`, background: surface }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                  <h3 className="text-sm font-medium pr-4" style={{ color: text }}>{item.q}</h3>
                  <ChevronDown size={14} style={{
                    color: muted, flexShrink: 0,
                    transform: faqOpen === i ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.18s",
                  }} />
                </button>
                {faqOpen === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: muted }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────── */}
      <section className="py-24 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto">
          <h2 style={{ color: text, fontSize: "clamp(2.2rem, 4.5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "1.5rem", maxWidth: "600px" }}>
            Prêt à construire tes habitudes ?
          </h2>
          <p className="text-base mb-8 max-w-sm" style={{ color: muted }}>
            Commence aujourd'hui. 7 jours gratuits, sans carte bancaire.
          </p>
          <div className="flex items-center gap-3">
            <button onClick={spawn} className="btn-primary flex items-center gap-2 text-sm px-6 py-3">
              Commencer gratuitement <ArrowRight size={14} />
            </button>
            <span className="text-xs" style={{ color: faint }}>Puis 6€/mois · Annulable à tout moment</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className="px-6 py-8" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo.svg" alt="Trakova" style={{ height: "48px", width: "auto" }} />
          <p className="text-xs" style={{ color: faint }}>© 2026 Trakova</p>
          <div className="flex items-center gap-5 text-xs" style={{ color: faint }}>
            <a href="/subscribe" className="hover:opacity-70 transition-opacity">Abonnement</a>
            <a href="/contact"   className="hover:opacity-70 transition-opacity">Contact</a>
            <a href="/cgu"       className="hover:opacity-70 transition-opacity">CGU</a>
            <a href="/privacy"   className="hover:opacity-70 transition-opacity">Confidentialité</a>
          </div>
        </div>
      </footer>

      {/* ── STICKY CTA MOBILE ───────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 pb-4 pt-3"
        style={{
          background: isDark ? "rgba(8,8,9,0.96)" : "rgba(245,245,247,0.96)",
          backdropFilter: "blur(16px)",
          borderTop: `1px solid ${border}`,
        }}>
        <button onClick={spawn} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm">
          Essai gratuit 7 jours — sans carte <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}
