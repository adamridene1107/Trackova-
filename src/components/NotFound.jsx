export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background:"#0A0A0F" }}>
      <div className="text-center fade-in">
        <p className="text-8xl mb-6">🎯</p>
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-white/50 text-lg mb-8">Cette page n existe pas.</p>
        <a href="/" className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
          Retour a l accueil
        </a>
      </div>
    </div>
  )
}