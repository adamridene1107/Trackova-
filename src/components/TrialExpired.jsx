import { Zap, Lock, Check, Sparkles, ArrowRight } from "lucide-react"

const FREE_FEATURES = [
  "Objectif du jour (tâches fixes)",
  "Mood & victoire du jour",
  "Max 2 tâches ponctuelles/jour",
  "Max 3 tâches au total",
  "Max 1 mission",
]

const PRO_FEATURES = [
  "Tout du plan gratuit, sans limites",
  "Planning hebdo Google Calendar",
  "Pomodoro & Mode Focus",
  "Stats, historique, calendrier",
  "Fichiers, XP & niveaux",
  "Sons d'ambiance & Export PDF",
  "Toutes les futures fonctionnalités",
]

export default function TrialExpired() {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{ background: "#0A0A0F" }}>

      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", width:500, height:500, top:"-15%", left:"-10%", background:"radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", width:400, height:400, bottom:"-10%", right:"-10%", background:"radial-gradient(circle, rgba(168,85,247,0.1), transparent 70%)", borderRadius:"50%" }} />
      </div>

      <div className="w-full max-w-sm relative z-10">

        {/* Logo + titre */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background:"linear-gradient(135deg,#8b5cf6,#6366f1)", boxShadow:"0 14px 36px rgba(139,92,246,0.45)" }}>
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1" style={{ letterSpacing:"-0.03em" }}>
            Ton essai est terminé
          </h1>
          <p className="text-sm" style={{ color:"rgba(255,255,255,0.4)" }}>
            Choisis comment continuer sur Trakova
          </p>
        </div>

        {/* Carte Gratuit */}
        <div className="rounded-2xl p-5 mb-3"
          style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-bold text-base">Plan Gratuit</p>
              <p className="text-2xl font-black text-white mt-0.5">0€ <span className="text-sm font-normal" style={{ color:"rgba(255,255,255,0.35)" }}>/ toujours</span></p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.1)" }}>
              Limité
            </span>
          </div>
          <ul className="space-y-2 mb-4">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-xs" style={{ color:"rgba(255,255,255,0.45)" }}>
                <Check size={12} className="flex-shrink-0 mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }} />
                {f}
              </li>
            ))}
            <li className="flex items-center gap-2.5 text-xs" style={{ color:"rgba(255,255,255,0.25)" }}>
              <Lock size={11} className="flex-shrink-0" />
              Planning, Stats, Fichiers, XP…
            </li>
          </ul>
          <a href="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.1)" }}>
            Continuer gratuitement
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Carte Pro */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background:"linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.12))", border:"1px solid rgba(139,92,246,0.35)", boxShadow:"0 20px 60px rgba(99,102,241,0.15)" }}>

          {/* Badge recommandé */}
          <div className="absolute top-3.5 right-4">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background:"linear-gradient(135deg,#8b5cf6,#6366f1)", color:"#fff" }}>
              RECOMMANDÉ
            </span>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} style={{ color:"#a78bfa" }} />
              <p className="text-white font-bold text-base">Plan Pro</p>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-white/30 text-base line-through">10€</span>
              <span className="text-3xl font-black text-white" style={{ letterSpacing:"-0.03em" }}>6€</span>
              <span className="text-sm mb-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>/mois</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold ml-1"
                style={{ background:"rgba(34,197,94,0.2)", color:"#34d399", border:"1px solid rgba(34,197,94,0.3)" }}>
                -40%
              </span>
            </div>
          </div>

          <ul className="space-y-2 mb-5">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-xs" style={{ color:"rgba(255,255,255,0.7)" }}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background:"rgba(139,92,246,0.25)", border:"1px solid rgba(139,92,246,0.4)" }}>
                  <Check size={9} style={{ color:"#a78bfa" }} />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <a href="/subscribe"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background:"linear-gradient(135deg,#8b5cf6,#6366f1)", color:"#fff", boxShadow:"0 8px 24px rgba(99,102,241,0.4)" }}>
            <Zap size={14} />
            Commencer l'essai gratuit
          </a>
          <p className="text-center text-[11px] mt-2.5" style={{ color:"rgba(255,255,255,0.25)" }}>
            7 jours gratuits · Annulable à tout moment
          </p>
        </div>

      </div>
    </div>
  )
}
