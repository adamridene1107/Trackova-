import { Clock, XCircle } from "lucide-react"

export default function TrialExpired() {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center">
      <div className="fade-in space-y-4 max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mx-auto">
          <Clock size={32} className="text-white/50" />
        </div>
        <h1 className="text-2xl font-black text-white">Essai terminé</h1>
        <p className="text-white/40 text-sm">Ton essai gratuit de 7 jours est expiré. Abonne-toi pour continuer à utiliser l'app.</p>
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3 text-left">
            <XCircle size={16} className="text-white/30 flex-shrink-0" />
            <span className="text-white/40 text-sm">Accès bloqué</span>
          </div>
          <a href="/subscribe"
            className="block w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all text-center">
            S'abonner pour 6€ / mois
          </a>
        </div>
      </div>
    </div>
  )
}