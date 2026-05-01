import { Component } from "react"

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error("🔴 Crash React:", error.message)
    console.error(info?.componentStack?.slice(0, 500))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 24, background: "#0A0A0F", minHeight: "100vh",
          color: "white", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h2 style={{ color: "#f87171", fontWeight: 700, fontSize: 18, margin: 0 }}>
            Une erreur s'est produite
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0,
            maxWidth: 440, textAlign: "center",
          }}>
            {this.state.error?.message || "Erreur inconnue"}
          </p>
          <pre style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "10px 14px", fontSize: 10,
            color: "#a78bfa", maxWidth: 440, overflowX: "auto",
            whiteSpace: "pre-wrap", wordBreak: "break-all",
          }}>
            {this.state.error?.stack?.slice(0, 600)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8, padding: "10px 24px", background: "#6366f1",
              border: "none", borderRadius: 10, color: "white",
              cursor: "pointer", fontWeight: 600, fontSize: 14,
            }}>
            Recharger la page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
