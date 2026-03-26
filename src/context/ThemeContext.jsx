import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext({ theme: "dark", setTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme_] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gt_settings") || "{}").theme || "dark" } catch { return "dark" }
  })

  const setTheme = (t) => {
    setTheme_(t)
    try {
      const s = JSON.parse(localStorage.getItem("gt_settings") || "{}")
      s.theme = t
      localStorage.setItem("gt_settings", JSON.stringify(s))
    } catch {}
  }

  useEffect(() => {
    const root = document.documentElement
    if (theme === "light") {
      root.setAttribute("data-theme", "light")
      root.style.setProperty("--app-bg", "#f0f0f5")
      root.style.setProperty("--card-bg", "rgba(255,255,255,0.95)")
      root.style.setProperty("--header-bg", "rgba(240,240,245,0.95)")
      root.style.setProperty("--text-primary", "#1a1a2e")
      root.style.setProperty("--text-muted", "rgba(26,26,46,0.5)")
      root.style.setProperty("--border-color", "rgba(0,0,0,0.08)")
    } else {
      root.setAttribute("data-theme", "dark")
      root.style.setProperty("--app-bg", "#0A0A0F")
      root.style.setProperty("--card-bg", "rgba(255,255,255,0.04)")
      root.style.setProperty("--header-bg", "rgba(12,12,20,0.95)")
      root.style.setProperty("--text-primary", "#ffffff")
      root.style.setProperty("--text-muted", "rgba(255,255,255,0.5)")
      root.style.setProperty("--border-color", "rgba(139,92,246,0.1)")
    }
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)