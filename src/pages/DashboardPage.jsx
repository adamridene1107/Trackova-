import App from "../App"

export default function DashboardPage({ user, onLogout }) {
  return <App user={user} onLogout={onLogout} />
}
