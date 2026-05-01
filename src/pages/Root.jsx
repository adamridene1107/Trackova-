import { useState, useEffect, Suspense } from "react"
import { ThemeProvider } from "../context/ThemeContext"
import { LangProvider } from "../context/LangContext"
import { GoalDataProvider } from "../context/GoalDataContext"
import { supabase } from "../lib/supabase"
import { Analytics } from "@vercel/analytics/react"
import AuthPage from "../components/AuthPage"
import LandingPage from "../components/LandingPage"
import Subscription from "../components/Subscription"
import SuccessPage from "../components/SuccessPage"
import TrialExpired from "../components/TrialExpired"
import AdminPage from "../components/AdminPage"
import LegalPage from "../components/LegalPage"
import ContactPage from "../components/ContactPage"
import ProfilePage from "../components/ProfilePage"
import ResetPasswordPage from "../components/ResetPasswordPage"
import DashboardPage from "./DashboardPage"
import ErrorBoundary from "../components/ErrorBoundary"

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0F" }}>
    <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
  </div>
)

function RootContent() {
  const path = window.location.pathname
  const [session, setSession] = useState(undefined)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    // Charge la session initiale en premier
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthReady(true)
    })

    // onAuthStateChange ne met à jour que si on est déjà prêt
    // (évite le flash landing page lors d'un token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // SIGNED_OUT = vrai logout → on met à jour
      // TOKEN_REFRESHED / SIGNED_IN = ne pas passer par null
      if (event === "SIGNED_OUT") {
        setSession(null)
      } else if (session) {
        setSession(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const publicRoutes = [
    "/reset-password",
    "/subscribe",
    "/success",
    "/trial-expired",
    "/admin",
    "/privacy",
    "/cgu",
    "/contact",
  ]

  if (publicRoutes.includes(path)) {
    if (path === "/reset-password") return <Suspense fallback={<Spinner />}><ResetPasswordPage /></Suspense>
    if (path === "/subscribe") return <Suspense fallback={<Spinner />}><Subscription /></Suspense>
    if (path === "/success") return <Suspense fallback={<Spinner />}><SuccessPage /></Suspense>
    if (path === "/trial-expired") return <Suspense fallback={<Spinner />}><TrialExpired /></Suspense>
    if (path === "/admin") return <Suspense fallback={<Spinner />}><AdminPage /></Suspense>
    if (path === "/privacy") return <Suspense fallback={<Spinner />}><LegalPage type="privacy" /></Suspense>
    if (path === "/cgu") return <Suspense fallback={<Spinner />}><LegalPage type="cgu" /></Suspense>
    if (path === "/contact") return <Suspense fallback={<Spinner />}><ContactPage /></Suspense>
  }

  if (path.startsWith("/profile/")) {
    return <Suspense fallback={<Spinner />}><ProfilePage /></Suspense>
  }

  if (!authReady) return <Spinner />

  if (!session) {
    if (path === "/login") {
      return (
        <Suspense fallback={<Spinner />}>
          <AuthPage onAuth={(user, isNew) => {
            // Nouvel utilisateur → accès direct avec plan gratuit
            window.location.href = "/"
          }} />
        </Suspense>
      )
    }

    return (
      <Suspense fallback={<Spinner />}>
        <LandingPage onGetStarted={() => { window.location.href = "/login" }} />
      </Suspense>
    )
  }

  const user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata?.name || session.user.email.split("@")[0],
  }

  return (
    <ErrorBoundary>
      <GoalDataProvider userId={user.id}>
        <Suspense fallback={<Spinner />}>
          <DashboardPage user={user} onLogout={async () => {
            await supabase.auth.signOut()
            const s = JSON.parse(localStorage.getItem("gt_settings") || "{}")
            s.theme = "dark"
            localStorage.setItem("gt_settings", JSON.stringify(s))
            window.location.href = "/"
          }} />
        </Suspense>
      </GoalDataProvider>
    </ErrorBoundary>
  )
}

export default function Root() {
  return (
    <ThemeProvider>
      <LangProvider>
        <RootContent />
        <Analytics />
      </LangProvider>
    </ThemeProvider>
  )
}
