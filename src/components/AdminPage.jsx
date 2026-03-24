import { useState } from "react"
import { Lock, Eye, EyeOff } from "lucide-react"

const ADMIN_PASSWORD = "admin2024"

const PAGES = [
  { id: "subscribe", label: "Page abonnement", desc: "Essai 7 jours gratuits", path: "/subscribe" },
  { id: "success", label: "Page succes", desc: "Après paiement réussi", path: "/success" },
  { id: "trial-expired", label: "Essai expire", desc: "Quand les 7 jours sont écoulés", path: "/trial-expired" },
  { id: "app", label: "App principale", desc: "L'application normale", path: "/" },
]

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [auth, setAuth] = useState(false)
  const [error, setError] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuth(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
        <div className="w-full max-w-xs fade-in">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Lock size={20} className="text-white/50" />
            </div>
            <h1 className="text-xl font-black text-white">Admin</h1>
            <p className="text-white/30 text-xs mt-1">Accès restreint</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full bg-[#111111] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-white/20 pr-10"
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs text-center">Mot de passe incorrect</p>}
            <button type="submit"
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all">
              Entrer
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] p-6">
      <div className="max-w-sm mx-auto fade-in">
        <div className="mb-8">
          <h1 className="text-xl font-black text-white">Panel Admin</h1>
          <p className="text-white/30 text-xs mt-1">Tester les différentes pages</p>
        </div>

        <div className="space-y-3">
          {PAGES.map(p => (
            <a key={p.id} href={p.path}
              className="block bg-[#111111] border border-white/[0.08] rounded-xl p-4 hover:border-white/20 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-semibold group-hover:text-white/90">{p.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">{p.desc}</p>
                </div>
                <span className="text-white/20 text-xs font-mono">{p.path}</span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 bg-[#111111] border border-white/[0.08] rounded-xl p-4">
          <p className="text-white/40 text-xs font-semibold mb-3">Carte test Stripe</p>
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-white/30 text-xs">Numero</span>
              <span className="text-white/60 text-xs">4242 4242 4242 4242</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/30 text-xs">Expiration</span>
              <span className="text-white/60 text-xs">12/26</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/30 text-xs">CVC</span>
              <span className="text-white/60 text-xs">123</span>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-[#111111] border border-white/[0.08] rounded-xl p-4">
          <p className="text-white/40 text-xs font-semibold mb-3">Cartes test spéciales</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-xs">Paiement refusé</span>
              <span className="text-white/60 text-xs font-mono">4000 0000 0000 0002</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-xs">Fonds insuffisants</span>
              <span className="text-white/60 text-xs font-mono">4000 0000 0000 9995</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-xs">3D Secure requis</span>
              <span className="text-white/60 text-xs font-mono">4000 0025 0000 3155</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}