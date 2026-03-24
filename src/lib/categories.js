// Categories adaptees par objectif
export const CATEGORIES_BY_GOAL = {
  homework: [
    { v:"maths",    l:"Maths",       color:"bg-blue-500/10 text-blue-400",     emoji:"📐" },
    { v:"francais", l:"Français",    color:"bg-pink-500/10 text-pink-400",     emoji:"📝" },
    { v:"histoire", l:"Histoire",    color:"bg-amber-500/10 text-amber-400",   emoji:"🏛️" },
    { v:"geo",      l:"Géo",         color:"bg-emerald-500/10 text-emerald-400", emoji:"🌍" },
    { v:"sciences", l:"Sciences",    color:"bg-purple-500/10 text-purple-400", emoji:"🔬" },
    { v:"anglais",  l:"Anglais",     color:"bg-sky-500/10 text-sky-400",       emoji:"🇬🇧" },
    { v:"espagnol", l:"Espagnol",    color:"bg-orange-500/10 text-orange-400", emoji:"��🇸" },
    { v:"philo",    l:"Philo",       color:"bg-violet-500/10 text-violet-400", emoji:"🧠" },
    { v:"svt",      l:"SVT",         color:"bg-green-500/10 text-green-400",   emoji:"🌿" },
    { v:"physique", l:"Physique",    color:"bg-cyan-500/10 text-cyan-400",     emoji:"⚗️" },
    { v:"info",     l:"Informatique",color:"bg-slate-500/10 text-slate-400",   emoji:"💻" },
    { v:"autre",    l:"Autre",       color:"bg-white/10 text-white/40",        emoji:"📚" },
  ],
  creative: [
    { v:"dessin",   l:"Dessin",      color:"bg-pink-500/10 text-pink-400",     emoji:"🎨" },
    { v:"musique",  l:"Musique",     color:"bg-purple-500/10 text-purple-400", emoji:"🎵" },
    { v:"ecriture", l:"Écriture",    color:"bg-amber-500/10 text-amber-400",   emoji:"✍️" },
    { v:"photo",    l:"Photo",       color:"bg-sky-500/10 text-sky-400",       emoji:"📷" },
    { v:"video",    l:"Vidéo",       color:"bg-red-500/10 text-red-400",       emoji:"🎬" },
    { v:"code",     l:"Code",        color:"bg-green-500/10 text-green-400",   emoji:"💻" },
    { v:"design",   l:"Design",      color:"bg-blue-500/10 text-blue-400",     emoji:"🖌️" },
    { v:"autre",    l:"Autre",       color:"bg-white/10 text-white/40",        emoji:"🎭" },
  ],
  organization: [
    { v:"perso",    l:"Personnel",   color:"bg-blue-500/10 text-blue-400",     emoji:"👤" },
    { v:"scolaire", l:"Scolaire",    color:"bg-amber-500/10 text-amber-400",   emoji:"🎒" },
    { v:"maison",   l:"Maison",      color:"bg-emerald-500/10 text-emerald-400", emoji:"🏠" },
    { v:"finances", l:"Finances",    color:"bg-green-500/10 text-green-400",   emoji:"💰" },
    { v:"social",   l:"Social",      color:"bg-pink-500/10 text-pink-400",     emoji:"👥" },
    { v:"sante",    l:"Santé",       color:"bg-red-500/10 text-red-400",       emoji:"❤️" },
    { v:"autre",    l:"Autre",       color:"bg-white/10 text-white/40",        emoji:"📋" },
  ],
  sport: [
    { v:"cardio",   l:"Cardio",      color:"bg-red-500/10 text-red-400",       emoji:"🏃" },
    { v:"muscu",    l:"Muscu",       color:"bg-orange-500/10 text-orange-400", emoji:"💪" },
    { v:"yoga",     l:"Yoga",        color:"bg-purple-500/10 text-purple-400", emoji:"🧘" },
    { v:"natation", l:"Natation",    color:"bg-sky-500/10 text-sky-400",       emoji:"🏊" },
    { v:"foot",     l:"Football",    color:"bg-green-500/10 text-green-400",   emoji:"⚽" },
    { v:"basket",   l:"Basket",      color:"bg-amber-500/10 text-amber-400",   emoji:"🏀" },
    { v:"tennis",   l:"Tennis",      color:"bg-yellow-500/10 text-yellow-400", emoji:"🎾" },
    { v:"velo",     l:"Vélo",        color:"bg-emerald-500/10 text-emerald-400", emoji:"🚴" },
    { v:"nutrition",l:"Nutrition",   color:"bg-lime-500/10 text-lime-400",     emoji:"🥗" },
    { v:"autre",    l:"Autre",       color:"bg-white/10 text-white/40",        emoji:"🏅" },
  ],
}

export function getCategoriesForGoal(goalId) {
  return CATEGORIES_BY_GOAL[goalId] || CATEGORIES_BY_GOAL.homework
}

export function getCategoryInfo(goalId, catValue) {
  const cats = getCategoriesForGoal(goalId)
  return cats.find(c => c.v === catValue) || cats[cats.length - 1]
}