import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react"

const MODES = [
  { id:"work",  label:"Focus",  min:25, color:"#8b5cf6" },
  { id:"short", label:"Pause",  min:5,  color:"#10b981" },
  { id:"long",  label:"Longue", min:15, color:"#3b82f6" },
]

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.value = 880; o.type = "sine"
    g.gain.setValueAtTime(0.3, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.8)
  } catch {}
}

export default function PomodoroWidget({ onFocusComplete }) {
  const [mode, setMode] = useState("work")
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(() => {
    try { return parseInt(localStorage.getItem("pomo_sessions") || "0") } catch { return 0 }
  })
  const ref = useRef(null)

  const current = MODES.find(m => m.id === mode)

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(ref.current)
            setRunning(false)
            beep()
            if (mode === "work") {
              const n = sessions + 1
              setSessions(n)
              localStorage.setItem("pomo_sessions", n)
              onFocusComplete?.()
              if (Notification.permission === "granted") {
                new Notification("Trakova — Session terminée ! 🎉", { body: "Prends une pause bien méritée." })
              }
            } else {
              if (Notification.permission === "granted") {
                new Notification("Trakova — Pause terminée !", { body: "Retour au focus !" })
              }
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(ref.current)
    }
    return () => clearInterval(ref.current)
  }, [running, mode])

  const switchMode = (m) => {
    setMode(m); setRunning(false)
    setSeconds(MODES.find(x => x.id === m).min * 60)
  }

  const reset = () => { setRunning(false); setSeconds(current.min * 60) }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")
  const pct = 1 - seconds / (current.min * 60)

  const r = 36, circ = 2 * Math.PI * r

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/70 text-sm font-semibold">Pomodoro</h3>
        <div className="flex gap-1">
          {MODES.map(m => (
            <button key={m.id} onClick={() => switchMode(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${mode===m.id ? "text-white font-medium" : "text-white/40 hover:text-white/60"}`}
              style={{ background: mode===m.id ? m.color+"25" : "transparent", border: mode===m.id ? `1px solid ${m.color}40` : "1px solid transparent" }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" className="-rotate-90">
            <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
            <circle cx="44" cy="44" r={r} fill="none" stroke={current.color} strokeWidth="4"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
              strokeLinecap="round" style={{ transition:"stroke-dashoffset 1s linear" }}/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg tabular-nums">{mm}:{ss}</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setRunning(r => !r)}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm flex-1 justify-center"
              style={{ background: current.color }}>
              {running ? <Pause size={14}/> : <Play size={14}/>}
              {running ? "Pause" : "Démarrer"}
            </button>
            <button onClick={reset} className="btn-ghost p-2"><RotateCcw size={14}/></button>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <Volume2 size={11}/>
            <span>{sessions} session{sessions !== 1 ? "s" : ""} aujourd'hui</span>
          </div>
        </div>
      </div>
    </div>
  )
}