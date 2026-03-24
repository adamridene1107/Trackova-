import { Bell } from "lucide-react"

export default function Notifications({ data, updateNotifications }) {
  const notif = data.notifications || { enabled: false, time: "20:00" }

  const toggle = () => {
    if (!notif.enabled && "Notification" in window) {
      Notification.requestPermission().then(p => {
        if (p === "granted") updateNotifications({ ...notif, enabled: true })
      })
    } else {
      updateNotifications({ ...notif, enabled: !notif.enabled })
    }
  }

  const setTime = (time) => updateNotifications({ ...notif, time })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium">Rappels quotidiens</p>
          <p className="text-white/25 text-xs mt-0.5">Notification chaque jour</p>
        </div>
        <button onClick={toggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${notif.enabled ? "bg-white" : "bg-white/10"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform ${notif.enabled ? "bg-black translate-x-5" : "bg-white/40"}`}/>
        </button>
      </div>
      {notif.enabled && (
        <div className="flex items-center gap-3">
          <Bell size={13} className="text-white/30"/>
          <span className="text-white/40 text-xs flex-1">Heure du rappel</span>
          <input type="time" value={notif.time} onChange={e=>setTime(e.target.value)}
            className="input w-28 text-xs"/>
        </div>
      )}
    </div>
  )
}