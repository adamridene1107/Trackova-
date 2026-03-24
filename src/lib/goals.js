export const GOALS = [
  {
    id: "homework", label: "Etudes", emoji: "📚",
    color: "from-blue-500 to-indigo-600", light: "bg-blue-50", accent: "text-blue-600", ring: "ring-blue-200",
    tasks: ["Faire mes devoirs seul(e)", "Relire mes lecons", "Preparer mon cartable"],
    tips: [
      "Commence par la matiere la plus difficile quand tu es frais(che) !",
      "Fais une pause de 5 min toutes les 25 min (technique Pomodoro).",
      "Pose tes questions a l ecole plutot que de bloquer seul(e).",
      "Un espace de travail range = un esprit concentre.",
      "Relis tes notes le soir meme pour mieux retenir.",
    ],
    challenges: [
      "Fais tes devoirs sans regarder ton telephone pendant 30 min.",
      "Explique une lecon a voix haute comme si tu l enseignais.",
      "Cree un resume colore d une lecon difficile.",
      "Fais un quiz sur tes lecons de la semaine.",
    ],
  },
  {
    id: "creative", label: "Projet creatif", emoji: "🎨",
    color: "from-pink-500 to-rose-600", light: "bg-pink-50", accent: "text-pink-600", ring: "ring-pink-200",
    tasks: ["Travailler sur mon projet", "Explorer une nouvelle idee", "Partager ma creation"],
    tips: [
      "L inspiration vient en faisant, pas en attendant !",
      "Garde un carnet d idees toujours avec toi.",
      "Regarde le travail d autres createurs pour t inspirer.",
      "Meme 15 minutes par jour font une grande difference.",
      "Les erreurs font partie du processus creatif.",
    ],
    challenges: [
      "Cree quelque chose en utilisant seulement 3 couleurs.",
      "Fais un projet en 10 minutes chrono.",
      "Inspire-toi d un objet du quotidien pour creer.",
      "Partage ta creation avec quelqu un aujourd hui.",
    ],
  },
  {
    id: "organization", label: "Organisation", emoji: "🗂️",
    color: "from-amber-500 to-orange-600", light: "bg-amber-50", accent: "text-amber-600", ring: "ring-amber-200",
    tasks: ["Planifier ma journee", "Ranger mon espace", "Cocher mes taches"],
    tips: [
      "Ecris tes 3 priorites du jour chaque matin.",
      "Un endroit pour chaque chose, chaque chose a sa place.",
      "Utilise des couleurs pour categoriser tes taches.",
      "Prepare tes affaires du lendemain le soir.",
      "Revise ton planning chaque dimanche soir.",
    ],
    challenges: [
      "Range ton bureau en moins de 5 minutes.",
      "Planifie toute ta semaine en un seul tableau.",
      "Elimine 3 choses dont tu n as plus besoin.",
      "Prepare ton sac/cartable la veille pendant 7 jours.",
    ],
  },
  {
    id: "sport", label: "Sport & Sante", emoji: "⚡",
    color: "from-green-500 to-emerald-600", light: "bg-green-50", accent: "text-green-600", ring: "ring-green-200",
    tasks: ["Faire mon activite physique", "Boire assez d eau", "Bien dormir"],
    tips: [
      "Commence petit : 10 minutes par jour c est deja super !",
      "Trouve une activite que tu aimes vraiment.",
      "L echauffement est aussi important que l entrainement.",
      "Le repos fait partie de la progression.",
      "Hydrate-toi avant, pendant et apres l effort.",
    ],
    challenges: [
      "Fais 20 sauts a la corde ou jumping jacks maintenant.",
      "Marche ou cours 15 minutes sans t arreter.",
      "Essaie un nouveau sport ou exercice aujourd hui.",
      "Fais des etirements pendant 10 minutes ce soir.",
    ],
  },
]

export const getGoalById = (id) => GOALS.find(g => g.id === id)

export function getDailyContent(goalId, dateStr) {
  const goal = getGoalById(goalId)
  if (!goal) return null
  const seed = dateStr.replace(/-/g, "").slice(-4)
  return {
    tip: goal.tips[parseInt(seed.slice(0, 2)) % goal.tips.length],
    challenge: goal.challenges[parseInt(seed.slice(2, 4)) % goal.challenges.length],
  }
}