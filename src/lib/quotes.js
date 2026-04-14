export const QUOTES = {
  "homework": [
    "Le succès, c'est tomber sept fois et se relever huit. — Proverbe japonais",
    "L'éducation est l'arme la plus puissante pour changer le monde. — Nelson Mandela",
    "Investir dans la connaissance rapporte les meilleurs intérêts. — Benjamin Franklin",
    "La discipline est le pont entre les objectifs et les accomplissements. — Jim Rohn",
    "Chaque expert a été un débutant. — Helen Hayes",
    "Le génie, c'est 1% d'inspiration et 99% de transpiration. — Thomas Edison",
    "Apprendre sans réfléchir est vain. Réfléchir sans apprendre est dangereux. — Confucius",
    "La connaissance s'acquiert par l'expérience, tout le reste n'est que de l'information. — Einstein",
    "Ne jamais considérer l'étude comme une obligation mais comme une opportunité. — Einstein",
    "Le seul moyen de faire du bon travail est d'aimer ce que l'on fait. — Steve Jobs",
    "Vous n'avez pas à être extraordinaire pour commencer, mais vous devez commencer pour être extraordinaire. — Zig Ziglar",
    "La persévérance est la clé du succès. — Charles Chaplin",
    "Chaque jour est une nouvelle chance de changer ta vie.",
    "Les limites existent seulement dans l'esprit. — Napoleon Hill",
    "Le moment présent sera toujours ce que tu en fais."
  ],
  "sport": [
    "Le corps accomplit ce que l'esprit croit. — Napoleon Hill",
    "La douleur est temporaire. Abandonner dure toujours. — Lance Armstrong",
    "Prends soin de ton corps, c'est le seul endroit où tu dois vivre. — Jim Rohn",
    "Le succès n'est pas final, l'échec n'est pas fatal. C'est le courage de continuer qui compte. — Churchill",
    "Les champions ne sont pas faits dans les salles de sport. Ils sont faits de quelque chose qu'ils ont au fond d'eux. — Muhammad Ali",
    "La santé est la vraie richesse, pas les pièces d'or et d'argent. — Gandhi",
    "Ton corps peut tout supporter. C'est ton esprit que tu dois convaincre.",
    "Chaque entraînement te rapproche de la version de toi que tu veux devenir.",
    "La régularité bat l'intensité. Montre-toi chaque jour.",
    "Le seul mauvais entraînement est celui que tu n'as pas fait.",
    "Sois plus fort que tes excuses.",
    "Repousse tes limites. Découvre qui tu es vraiment.",
    "La sueur d'aujourd'hui est la victoire de demain.",
    "Ton seul concurrent, c'est la version d'hier de toi-même.",
    "Fais-le maintenant. Parfois plus tard devient jamais."
  ],
  "creative": [
    "La créativité, c'est l'intelligence qui s'amuse. — Einstein",
    "Tout ce que tu peux imaginer est réel. — Pablo Picasso",
    "La créativité prend du courage. — Henri Matisse",
    "L'art est la manière dont l'âme parle au monde.",
    "Crée ce que tu veux voir dans le monde.",
    "L'inspiration existe, mais elle doit te trouver en train de travailler. — Picasso",
    "Chaque artiste trempe son pinceau dans sa propre âme. — Henry Ward Beecher",
    "La perfection est l'ennemie du bien. — Voltaire",
    "Ose être différent. Le monde a besoin de ta vision unique.",
    "Les grandes œuvres naissent de petits commencements.",
    "Crée avec passion, partage avec courage.",
    "L'art ne reproduit pas le visible, il rend visible. — Paul Klee",
    "Chaque création est une conversation avec l'univers.",
    "Le talent, c'est avoir envie de faire quelque chose. — Jules Renard",
    "Fais de ta vie une œuvre d'art."
  ],
  "organization": [
    "Pour chaque minute passée à organiser, une heure est gagnée. — Benjamin Franklin",
    "L'ordre est la clé de toutes les portes. — Victor Hugo",
    "Un objectif sans plan n'est qu'un souhait. — Antoine de Saint-Exupéry",
    "La discipline est choisir entre ce que tu veux maintenant et ce que tu veux le plus.",
    "Organise-toi ou sois organisé par les autres.",
    "Le secret du succès est la constance dans l'objectif. — Benjamin Disraeli",
    "Commence par faire ce qui est nécessaire, puis ce qui est possible. — François d'Assise",
    "Mieux vaut faire que parfaire.",
    "Les petites actions quotidiennes construisent les grands résultats.",
    "La productivité n'est jamais un accident. C'est le résultat d'un engagement envers l'excellence.",
    "Fais aujourd'hui ce que les autres ne veulent pas faire. Vis demain comme les autres ne peuvent pas vivre.",
    "Le temps est la ressource la plus précieuse. Utilise-le avec sagesse.",
    "Chaque tâche accomplie est un pas vers ton objectif.",
    "La clé n'est pas de prioriser ce qui est dans ton agenda, mais de planifier tes priorités.",
    "Sois le directeur de ta vie, pas juste un acteur."
  ]
}

export function getDailyQuote(goalId, dateStr) {
  const list = QUOTES[goalId] || QUOTES.homework
  const seed = parseInt(dateStr.replace(/-/g, "").slice(-3))
  return list[seed % list.length]
}
