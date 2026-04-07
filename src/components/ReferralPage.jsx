import { useState } from "react"
import { supabase } from "../lib/supabase"
import { Copy, Check, Gift, Users } from "lucide-react"

export default function ReferralPage({ user }) {
  const [copied, setCopied] = useState(false)
  const referralLink = `https://trackova.vercel.app/login?ref=${user?.id?.slice(0,8)}`

  const copy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="card">
        <h2 className="text-white font-bold text-lg mb-1">Programme de parrainage</h2>
        <p className="text-white/40 text-xs">Invite tes amis et gagne 1 mois gratuit par parrainage</p>
      </div>

      <div className="card" style={{ border:"1px solid rgba(139,92,246,0.2)", background:"rgba(139,92,246,0.05)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"rgba(139,92,246,0.2)" }}>
            <Gift size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">1 mois gratuit</p>
            <p className="text-white/40 text-xs">Pour toi et ton ami à chaque parrainage</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-white/40 text-xs font-medium">Ton lien de parrainage</p>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl text-xs font-mono text-white/60 truncate" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
              {referralLink}
            </div>
            <button onClick={copy} className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 flex-shrink-0">
              {copied ? <><Check size={12}/> Copié</> : <><Copy size={12}/> Copier</>}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-white/70 text-sm font-semibold mb-4">Comment ça marche</h3>
        <div className="space-y-3">
          {[
            { n:"1", text:"Partage ton lien avec un ami", icon:"🔗" },
            { n:"2", text:"Ton ami s'inscrit via ton lien", icon:"👤" },
            { n:"3", text:"Il souscrit à un abonnement", icon:"💳" },
            { n:"4", text:"Vous recevez tous les deux 1 mois gratuit", icon:"🎁" },
          ].map(s => (
            <div key={s.n} className="flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <p className="text-white/60 text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-violet-400" />
          <h3 className="text-white/70 text-sm font-semibold">Partager sur</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label:"WhatsApp", url:`https://wa.me/?text=Essaie Trakova, l'app pour atteindre tes objectifs ! ${encodeURIComponent(referralLink)}`, color:"#25D366" },
            { label:"Twitter/X", url:`https://twitter.com/intent/tweet?text=Je+recommande+Trakova+pour+gérer+tes+objectifs+!&url=${encodeURIComponent(referralLink)}`, color:"#1DA1F2" },
            { label:"Copier", action: copy, color:"#8b5cf6" },
          ].map(s => (
            <a key={s.label} href={s.url} target={s.url ? "_blank" : undefined} onClick={s.action}
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-medium text-white transition-all hover:opacity-80"
              style={{ background: s.color + "20", border:`1px solid ${s.color}40`, color: s.color }}>
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
