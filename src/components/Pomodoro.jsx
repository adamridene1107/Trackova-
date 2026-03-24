import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw } from "lucide-react"

const MODES = [
  { id:"work",  label:"Travail",      duration:25*60 },
  { id:"short", label:"Pause",        duration:5*60  },
  { id:"long",  label:"Grande pause", duration:15*60 },
]

export default function Pomodoro({ onFocusComplete }) {
  const [modeIdx, setModeIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const ref = useRef(null)
  const mode = MODES[modeIdx]

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(ref.current)
            setRunning(false)
            if (modeIdx === 0) { setSessions(s => s + 1); onFocusComplete?.(25) }
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(modeIdx === 0 ? "Pause bien meritee !" : "Au travail !", {
                body: modeIdx === 0 ? "25 min ecoulees." : "La pause est terminee !"
              })
            }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(ref.current)
    }
    return () => clearInterval(ref.current)
  }, [running, modeIdx])

  const switchMode = (i) => { setModeIdx(i); setTimeLeft(MODES[i].duration); setRunning(false) }
  const reset = () => { setTimeLeft(mode.duration); setRunning(false) }
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0")
  const secs = String(timeLeft % 60).padStart(2, "0")
  const pct = ((mode.duration - timeLeft) / mode.duration) * 100
  const r = 44
  const circ = 2 * Math.PI * r

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">Pomodoro</h3>
        <span className="text-white/30 text-xs">{sessions} session{sessions !== 1 ? "s" : ""}</span>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-5 bg-white/[0.04] rounded-xl p-1">
        {MODES.map((m, i) => (
          <button key={m.id} onClick={() => switchMode(i)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              modeIdx === i ? "bg-white text-black" : "text-white/30 hover:text-white/60"
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="6"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white tabular-nums tracking-tight">{mins}:{secs}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={reset} className="btn-ghost">
            <RotateCcw size={15}/>
          </button>
          <button onClick={() => setRunning(r => !r)}
            className="btn-primary px-8 flex items-center gap-2">
            {running ? <Pause size={14}/> : <Play size={14}/>}
            {running ? "Pause" : "Demarrer"}
          </button>
        </div>
      </div>
    </div>
  )
}