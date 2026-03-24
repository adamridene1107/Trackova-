import { Download } from "lucide-react"
import { getGoalById } from "../lib/goals"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function ExportPDF({ data }) {
  const goal = getGoalById(data.goal)
  const handle = async () => {
    const { jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")
    const doc = new jsPDF()
    doc.setFontSize(18); doc.setTextColor(30,30,30)
    doc.text("Goal Tracker", 14, 18)
    doc.setFontSize(11); doc.setTextColor(100,100,100)
    doc.text(`Objectif : ${goal?.label||""} ${goal?.emoji||""}`, 14, 28)
    doc.text(`Exporte le : ${format(new Date(),"d MMMM yyyy",{locale:fr})}`, 14, 35)
    doc.text(`Serie : ${data.streak} jour(s)`, 14, 42)
    const rows = Object.entries(data.entries||{}).sort(([a],[b])=>a.localeCompare(b)).map(([date,e])=>[
      format(new Date(date),"d MMM yyyy",{locale:fr}),
      e.done?"Complet":e.tasks?.some(Boolean)?"Partiel":"Non fait",
      e.victory||"-"
    ])
    autoTable(doc,{startY:50,head:[["Date","Statut","Victoire"]],body:rows,headStyles:{fillColor:[20,20,20]},alternateRowStyles:{fillColor:[245,245,245]}})
    doc.save(`goal-tracker-${format(new Date(),"yyyy-MM-dd")}.pdf`)
  }
  return (
    <button onClick={handle} className="btn-ghost flex items-center gap-1.5 text-xs">
      <Download size={14}/> PDF
    </button>
  )
}