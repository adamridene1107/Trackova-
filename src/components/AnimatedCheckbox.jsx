export default function AnimatedCheckbox({ checked, onChange, size = 20 }) {
  return (
    <button
      onClick={onChange}
      className="flex-shrink-0 transition-all duration-200 active:scale-90"
      style={{ width: size, height: size }}
    >
      {checked ? (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="1.5"/>
          <polyline
            points="6,12 10,16 18,8"
            stroke="#a78bfa"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="checkbox-tick"
          />
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        </svg>
      )}
    </button>
  )
}