import { useState, useRef, useEffect } from "react"
import { Music, Volume2, VolumeX, Coffee, Wind, Waves, TreePine } from "lucide-react"

const SOUNDS = [
  { id:"lofi",   label:"Lofi",   icon:Music,    type:"lofi" },
  { id:"rain",   label:"Pluie",  icon:Waves,    type:"rain" },
  { id:"cafe",   label:"Café",   icon:Coffee,   type:"cafe" },
  { id:"forest", label:"Forêt",  icon:TreePine, type:"forest" },
  { id:"wind",   label:"Vent",   icon:Wind,     type:"wind" },
]

function createLofi(ctx) {
  const nodes = []
  const master = ctx.createGain()
  master.gain.value = 1

  // Warm low-pass filter (son étouffé typique lofi)
  const warmFilter = ctx.createBiquadFilter()
  warmFilter.type = "lowpass"
  warmFilter.frequency.value = 900
  warmFilter.Q.value = 0.7
  warmFilter.connect(master)

  // Vinyl crackle (bruit aléatoire clairsemé)
  const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
  const cd = crackleBuffer.getChannelData(0)
  for (let i = 0; i < cd.length; i++) {
    cd[i] = Math.random() < 0.0015 ? (Math.random() * 2 - 1) * 0.6 : 0
  }
  const crackleSrc = ctx.createBufferSource()
  crackleSrc.buffer = crackleBuffer
  crackleSrc.loop = true
  const crackleGain = ctx.createGain()
  crackleGain.gain.value = 0.04
  crackleSrc.connect(crackleGain)
  crackleGain.connect(warmFilter)
  nodes.push(crackleSrc)

  // Background hiss (bruit de fond chaud)
  const hissBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const hd = hissBuffer.getChannelData(0)
  for (let i = 0; i < hd.length; i++) hd[i] = (Math.random() * 2 - 1)
  const hissSrc = ctx.createBufferSource()
  hissSrc.buffer = hissBuffer
  hissSrc.loop = true
  const hissFilter = ctx.createBiquadFilter()
  hissFilter.type = "lowpass"
  hissFilter.frequency.value = 300
  const hissGain = ctx.createGain()
  hissGain.gain.value = 0.012
  hissSrc.connect(hissFilter)
  hissFilter.connect(hissGain)
  hissGain.connect(warmFilter)
  nodes.push(hissSrc)

  // Accords jazz (Cmaj7 → Am7 → Fmaj7 → G7)
  const chords = [
    [130.81, 164.81, 196.00, 246.94], // Cmaj7
    [110.00, 130.81, 164.81, 207.65], // Am7
    [87.31,  110.00, 130.81, 164.81], // Fmaj7
    [98.00,  123.47, 146.83, 174.61], // G7
  ]
  const BPM = 76
  const barMs = (60 / BPM) * 4 * 1000
  let chordIdx = 0

  const playChord = (startTime) => {
    const chord = chords[chordIdx % chords.length]
    chordIdx++
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = i % 2 === 0 ? "triangle" : "sine"
      osc.frequency.value = freq * (1 + (Math.random() - 0.5) * 0.004) // légère désaccordation

      // LFO pour tape flutter
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.3 + Math.random() * 0.2
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = freq * 0.003
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)

      const env = ctx.createGain()
      const t = startTime
      env.gain.setValueAtTime(0, t)
      env.gain.linearRampToValueAtTime(0.06 - i * 0.01, t + 0.3)
      env.gain.setValueAtTime(0.06 - i * 0.01, t + barMs / 1000 - 0.4)
      env.gain.linearRampToValueAtTime(0, t + barMs / 1000)

      osc.connect(env)
      env.connect(warmFilter)
      osc.start(t)
      osc.stop(t + barMs / 1000)
      lfo.start(t)
      lfo.stop(t + barMs / 1000)
    })
  }

  // Jouer les accords en séquence
  let nextBar = ctx.currentTime + 0.1
  const scheduleChords = () => {
    while (nextBar < ctx.currentTime + 4) {
      playChord(nextBar)
      nextBar += barMs / 1000
    }
  }
  scheduleChords()
  const schedulerId = setInterval(scheduleChords, 1000)

  return {
    nodes,
    output: master,
    cleanup: () => clearInterval(schedulerId)
  }
}

function createNoise(ctx, type) {
  const buf = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1)
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true

  const filter = ctx.createBiquadFilter()
  if (type === "rain") {
    filter.type = "bandpass"
    filter.frequency.value = 2500
    filter.Q.value = 0.8
  } else if (type === "wind") {
    filter.type = "lowpass"
    filter.frequency.value = 350
    filter.Q.value = 1.2
  } else if (type === "forest") {
    filter.type = "bandpass"
    filter.frequency.value = 900
    filter.Q.value = 0.5
  } else if (type === "cafe") {
    filter.type = "bandpass"
    filter.frequency.value = 400
    filter.Q.value = 0.3
  }

  // LFO pour variation naturelle
  const lfo = ctx.createOscillator()
  lfo.frequency.value = type === "wind" ? 0.15 : 0.05
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = type === "wind" ? 200 : 80
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)

  const gain = ctx.createGain()
  gain.gain.value = type === "wind" ? 0.18 : 0.12
  src.connect(filter)
  filter.connect(gain)
  lfo.start()

  return { nodes: [src, lfo], output: gain, cleanup: () => {} }
}

export default function AmbientSound() {
  const [active, setActive] = useState(null)
  const [vol, setVol] = useState(0.35)
  const ctxRef = useRef(null)
  const gainRef = useRef(null)
  const cleanupRef = useRef(null)
  const nodesRef = useRef([])

  const stop = () => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.() } catch {} })
    nodesRef.current = []
    cleanupRef.current?.()
    cleanupRef.current = null
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null }
    setActive(null)
  }

  const play = (sound) => {
    stop()
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ctxRef.current = ctx
    const masterGain = ctx.createGain()
    masterGain.gain.value = vol
    gainRef.current = masterGain
    masterGain.connect(ctx.destination)

    const { nodes, output, cleanup } = sound.type === "lofi"
      ? createLofi(ctx)
      : createNoise(ctx, sound.type)

    output.connect(masterGain)
    nodes.forEach(n => { try { n.start?.() } catch {} })
    nodesRef.current = nodes
    cleanupRef.current = cleanup
    setActive(sound.id)
  }

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = vol
  }, [vol])

  useEffect(() => () => stop(), [])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/70 text-sm font-semibold">Son ambiant</h3>
        {active && <button onClick={stop} className="text-white/40 hover:text-white/60 transition-colors"><VolumeX size={14}/></button>}
      </div>
      <div className="flex gap-2 flex-wrap mb-3">
        {SOUNDS.map(s => {
          const Icon = s.icon
          return (
            <button key={s.id} onClick={() => active === s.id ? stop() : play(s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all"
              style={{
                background: active===s.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                border: active===s.id ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.06)",
                color: active===s.id ? "#818cf8" : "rgba(255,255,255,0.5)"
              }}>
              <Icon size={11}/> {s.label}
            </button>
          )
        })}
      </div>
      {active && (
        <div className="flex items-center gap-2">
          <Volume2 size={12} className="text-white/30 flex-shrink-0"/>
          <input type="range" min="0" max="1" step="0.05" value={vol}
            onChange={e => setVol(parseFloat(e.target.value))}
            className="flex-1 accent-indigo-500 h-1" />
        </div>
      )}
    </div>
  )
}
