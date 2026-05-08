import { useState } from "react"
import { Lock, Mail, User, Eye, EyeOff, ArrowLeft, Zap } from "lucide-react"
import { supabase } from "../lib/supabase"
import { useTheme } from "../context/ThemeContext"

export default function AuthPage({ onAuth }) {
  const { theme } = useTheme()
  const isDark = theme !== "light"

  const bg          = isDark ? "#0F0F11"               : "#F8F8FA"
  const surface     = isDark ? "#131318"               : "#ffffff"
  const border      = isDark ? "rgba(255,255,255,0.07)": "rgba(0,0,0,0.08)"
  const textPrimary = isDark ? "#E2E2E8"               : "#1a1a2e"
  const textMuted   = isDark ? "rgba(226,226,232,0.48)": "rgba(26,26,46,0.5)"
  const textFaint   = isDark ? "rgba(226,226,232,0.22)": "rgba(26,26,46,0.3)"

  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const goTo = (m) => { setMode(m); setError(""); setSuccess("") }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setLoading(true)

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect" : error.message) }
      else onAuth({ id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || email.split("@")[0] })

    } else if (mode === "signup") {
      if (!name.trim()) { setLoading(false); return setError("Entre ton prénom") }
      if (password.length < 6) { setLoading(false); return setError("Mot de passe trop court (6 min)") }
      if (!acceptTerms) { setLoading(false); return setError("Tu dois accepter les CGU") }
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name: name.trim() } }
      })
      if (error) { setError(error.message) }
      else if (data.user) {
        fetch("/api/welcome-email", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email, name: name.trim() }) }).catch(()=>{})
        onAuth({ id: data.user.id, email: data.user.email, name: name.trim() }, true)
      }

    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://trackova.vercel.app/reset-password"
      })
      if (error) setError(error.message)
      else { setSuccess("Email envoyé ! Vérifie ta boite mail."); goTo("verify") }

    } else if (mode === "reset") {
      if (newPassword.length < 6) { setLoading(false); return setError("Mot de passe trop court") }
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) setError(error.message)
      else { setSuccess("Mot de passe mis à jour !"); setTimeout(() => goTo("login"), 1500) }
    }

    setLoading(false)
  }

  const titles = {
    login:  { h: "Bon retour",          p: "Content de te revoir !" },
    signup: { h: "Crée ton compte",     p: "Accès gratuit · Sans carte requise" },
    forgot: { h: "Mot de passe oublié", p: "Entre ton email pour continuer" },
    verify: { h: "Email envoyé !",      p: "Vérifie ta boite mail" },
    reset:  { h: "Nouveau mot de passe",p: "Choisis un nouveau mot de passe" },
  }

  const inputIcon = { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: textFaint, pointerEvents: "none" }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: bg }}>
      <div className="w-full max-w-sm fade-up">

        {/* Back button */}
        <button
          onClick={() => goTo(mode === "login" || mode === "signup" ? "login" : "login")}
          className="inline-flex items-center gap-1.5 text-xs mb-8 transition-opacity hover:opacity-80"
          style={{ color: textMuted }}>
          <ArrowLeft size={12} />
          {mode === "login" || mode === "signup"
            ? <a href="/">Retour à l'accueil</a>
            : "Retour à la connexion"}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#6366f1" }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-2xl" style={{ color: textPrimary, letterSpacing: "-0.02em" }}>Trakova</span>
        </div>

        {/* Title */}
        <div className="mb-7" key={mode}>
          <h1 className="text-3xl font-bold mb-1.5 slide-in-right" style={{ color: textPrimary, letterSpacing: "-0.03em" }}>
            {titles[mode]?.h}
          </h1>
          <p className="text-sm slide-in-right" style={{ color: textMuted, animationDelay: "0.06s" }}>
            {titles[mode]?.p}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
          <form onSubmit={handleSubmit} className="space-y-3">

            {mode === "signup" && <>
              <div className="relative">
                <User size={13} style={inputIcon} />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Prénom" className="input pl-9" style={{ color: textPrimary }} />
              </div>
              <div className="relative">
                <Mail size={13} style={inputIcon} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" className="input pl-9" style={{ color: textPrimary }} />
              </div>
              <div className="relative">
                <Lock size={13} style={inputIcon} />
                <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mot de passe" className="input pl-9 pr-10" style={{ color: textPrimary }} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                  style={{ color: textFaint }}>
                  {show ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 flex-shrink-0 accent-indigo-500" />
                <span className="text-xs leading-relaxed" style={{ color: textMuted }}>
                  J'accepte les{" "}
                  <a href="/cgu" target="_blank" className="text-indigo-400 hover:underline">CGU</a>
                  {" "}et la{" "}
                  <a href="/privacy" target="_blank" className="text-indigo-400 hover:underline">politique de confidentialité</a>
                </span>
              </label>
            </>}

            {mode === "login" && <>
              <div className="relative">
                <Mail size={13} style={inputIcon} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" className="input pl-9" style={{ color: textPrimary }} />
              </div>
              <div className="relative">
                <Lock size={13} style={inputIcon} />
                <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mot de passe" className="input pl-9 pr-10" style={{ color: textPrimary }} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                  style={{ color: textFaint }}>
                  {show ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </>}

            {mode === "forgot" && (
              <div className="relative">
                <Mail size={13} style={inputIcon} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" className="input pl-9" style={{ color: textPrimary }} />
              </div>
            )}

            {mode === "reset" && (
              <div className="relative">
                <Lock size={13} style={inputIcon} />
                <input type={show ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe" className="input pl-9 pr-10" style={{ color: textPrimary }} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                  style={{ color: textFaint }}>
                  {show ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            )}

            {error && (
              <div className="px-3 py-2 rounded-lg text-xs text-red-400"
                style={{ background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.14)" }}>
                {error}
              </div>
            )}
            {success && (
              <div className="px-3 py-2 rounded-lg text-xs text-emerald-400"
                style={{ background:"rgba(52,211,153,0.07)", border:"1px solid rgba(52,211,153,0.14)" }}>
                {success}
              </div>
            )}

            {mode !== "verify" && (
              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm mt-1">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : mode === "login"  ? "Se connecter"
                  : mode === "signup" ? "Créer mon compte"
                  : mode === "forgot" ? "Envoyer le lien"
                  : "Réinitialiser"}
              </button>
            )}
          </form>
        </div>

        {/* Links below card */}
        {(mode === "login" || mode === "signup") && (
          <div className="mt-4 space-y-2 text-center">
            {mode === "login" && (
              <button onClick={() => goTo("forgot")}
                className="block w-full text-xs transition-opacity hover:opacity-80"
                style={{ color: textMuted }}>
                Mot de passe oublié ?
              </button>
            )}
            <p className="text-xs" style={{ color: textMuted }}>
              {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
              <button onClick={() => goTo(mode === "login" ? "signup" : "login")}
                className="text-indigo-400 hover:text-indigo-300 transition-colors">
                {mode === "login" ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
