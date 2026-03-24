import React, { useState } from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import Subscription from "./components/Subscription"
import SuccessPage from "./components/SuccessPage"
import TrialExpired from "./components/TrialExpired"
import AdminPage from "./components/AdminPage"
import LandingPage from "./components/LandingPage"
import AuthPage from "./components/AuthPage"
import "./index.css"

function getSession() {
  try { return JSON.parse(localStorage.getItem("gt_session")) } catch { return null }
}

function Root() {
  const path = window.location.pathname
  const [session, setSession] = useState(getSession)

  if (path === "/subscribe") return <Subscription />
  if (path === "/success") return <SuccessPage />
  if (path === "/trial-expired") return <TrialExpired />
  if (path === "/admin") return <AdminPage />
  if (path === "/login") return <AuthPage onAuth={(u) => { setSession(u); window.location.href = "/" }} />

  if (!session) return <LandingPage onGetStarted={() => { window.location.href = "/login" }} />

  return <App user={session} onLogout={() => { localStorage.removeItem("gt_session"); setSession(null) }} />
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Root /></React.StrictMode>
)