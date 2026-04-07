import { useState, useEffect } from "react"

export default function CountdownTimer({ targetDate }) {
  const [time, setTime] = useState({ days:0, hours:0, mins:0, secs:0 })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) return setTime({ days:0, hours:0, mins:0, secs:0 })
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [targetDate])

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      <span className="text-red-400 font-bold">⏰</span>
      {time.days > 0 && <span className="text-red-400 font-bold">{time.days}j</span>}
      <span className="text-red-400 font-bold">{String(time.hours).padStart(2,"0")}h</span>
      <span className="text-red-400/60">:</span>
      <span className="text-red-400 font-bold">{String(time.mins).padStart(2,"0")}m</span>
      <span className="text-red-400/60">:</span>
      <span className="text-red-400 font-bold">{String(time.secs).padStart(2,"0")}s</span>
    </div>
  )
}
