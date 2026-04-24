import { useState } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"

const STEPS = [
  { emoji:"🎯", title:"Bienvenue sur Trakova !",   desc:"L'app pour atteindre tes objectifs. Études, sport, projets — tout en un seul endroit.", accent:"#6366f1" },
  { emoji:"📋", title:"Tes tâches du jour",         desc:"Chaque jour, coche tes tâches pour maintenir ton streak. Plus tu es régulier, plus tu progresses !", accent:"#8b5cf6" },
  { emoji:"🔥", title:"Le système de streak",       desc:"Complète au moins une tâche par jour pour maintenir ta série. Le streak se remet à zéro si tu sautes une journée.", accent:"#f97316" },
  { emoji:"⚡", title:"XP et niveaux",               desc:"Chaque tâche complétée te rapporte des points XP. Monte en niveau et débloque des badges de récompense.", accent:"#f59e0b" },
  { emoji:"🚀", title:"C'est parti !",               desc:"Tu es prêt. Commence par choisir ton objectif et compléter ta première tâche du jour. Bonne chance !", accent:"#34d399" },
]

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState("right")
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const goNext = () => {
    if (isLast) return onDone()
    setDirection("right")
    setStep(s => s + 1)
  }
  const goPrev = () => {
    setDirection("left")
    setStep(s => s - 1)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 fade-in"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>

      {/* Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="mesh-orb mesh-orb-1" style={{ top: "10%", left: "5%", opacity: 0.3 }} />
        <div className="mesh-orb mesh-orb-2" style={{ bottom: "10%", right: "5%", opacity: 0.3 }} />
      </div>

      <div className="w-full max-w-sm relative card-premium fade-up" style={{ borderRadius: "1.75rem" }}>
        {/* Progress dots */}
        <div className="flex gap-2 mb-7 relative z-10">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: i < step ? "100%" : i === step ? "100%" : "0%",
                  background: i <= step ? `linear-gradient(90deg, ${STEPS[i].accent}, ${STEPS[Math.min(i+1, STEPS.length-1)].accent})` : "transparent",
                  boxShadow: i === step ? `0 0 12px ${STEPS[i].accent}80` : "none",
                }} />
            </div>
          ))}
        </div>

        <div key={step} className={`text-center py-6 relative z-10 ${direction === "right" ? "slide-in-right" : "slide-in-left"}`}>
          <div className="text-6xl mb-5 inline-block float" style={{ filter: `drop-shadow(0 8px 24px ${current.accent}60)` }}>
            {current.emoji}
          </div>
          <h2 className="text-white font-bold text-2xl mb-3" style={{ letterSpacing: "-0.03em" }}>{current.title}</h2>
          <p className="text-white/55 text-sm leading-relaxed px-2">{current.desc}</p>
        </div>

        <div className="flex gap-3 mt-8 relative z-10">
          {step > 0 && (
            <button onClick={goPrev}
              className="flex-1 py-3.5 rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
              <ChevronLeft size={14} /> Retour
            </button>
          )}
          <button onClick={goNext}
            className="btn-primary flex-1 py-3.5 text-sm flex items-center justify-center gap-2">
            {isLast ? "Commencer" : "Suivant"}
            {!isLast && <ChevronRight size={14} />}
          </button>
        </div>

        {!isLast && (
          <button onClick={onDone} className="w-full text-center text-white/25 text-xs mt-4 hover:text-white/50 transition-colors relative z-10">
            Passer le tutoriel
          </button>
        )}
      </div>
    </div>
  )
}
