import { CheckCircle2, Gift } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center">
      <div className="fade-in space-y-4 max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-white/70" />
        </div>
        <h1 className="text-2xl font-black text-white">Essai activé !</h1>
        <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Gift size={14} className="text-white/60" />
            <p className="text-white/80 text-sm font-semibold">7 jours gratuits</p>
          </div>
          <p className="text-white/30 text-xs">Aucun débit avant la fin de l'essai. Tu peux annuler à tout moment.</p>
        </div>
        <p className="text-white/40 text-sm">Profite de toutes les fonctionnalités sans limite.</p>
        <a href="/" className="inline-block mt-4 px-6 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-white/90 transition-all">
          Accéder à l'app
        </a>
      </div>
    </div>
  )
}