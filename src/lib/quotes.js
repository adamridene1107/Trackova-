export const QUOTES = {
  "homework": [
    "Le succes, c est tomber sept fois et se relever huit. — Proverbe japonais",
    "L education est l arme la plus puissante pour changer le monde. — Nelson Mandela",
    "Investir dans la connaissance rapporte les meilleurs interets. — Benjamin Franklin",
    "La discipline est le pont entre les objectifs et les accomplissements. — Jim Rohn",
    "Chaque expert a ete un debutant. — Helen Hayes",
    "Le genie, c est 1% d inspiration et 99% de transpiration. — Thomas Edison",
    "Apprendre sans reflechir est vain. Reflechir sans apprendre est dangereux. — Confucius",
    "La connaissance s acquiert par l experience, tout le reste n est que de l information. — Einstein",
    "Ne jamais considerer l etude comme une obligation mais comme une opportunite. — Einstein",
    "Le seul moyen de faire du bon travail est d aimer ce que l on fait. — Steve Jobs",
    "Vous n avez pas a etre extraordinaire pour commencer, mais vous devez commencer pour etre extraordinaire. — Zig Ziglar",
    "La perseverance est la cle du succes. — Charles Chaplin",
    "Chaque jour est une nouvelle chance de changer ta vie.",
    "Les limites existent seulement dans l esprit. — Napoleon Hill",
    "Le moment present sera toujours ce que tu en fais."
  ],
  "sport": [
    "Le corps accomplit ce que l esprit croit. — Napoleon Hill",
    "La douleur est temporaire. Abandonner dure toujours. — Lance Armstrong",
    "Prends soin de ton corps, c est le seul endroit ou tu dois vivre. — Jim Rohn",
    "Le succes n est pas final, l echec n est pas fatal. C est le courage de continuer qui compte. — Churchill",
    "Champions ne sont pas faits dans les salles de sport. Ils sont faits de quelque chose qu ils ont au fond d eux. — Muhammad Ali",
    "La sante est la vraie richesse, pas les pieces d or et d argent. — Gandhi",
    "Ton corps peut tout supporter. C est ton esprit que tu dois convaincre.",
    "Chaque entrainement te rapproche de la version de toi que tu veux devenir.",
    "La regularite bat l intensite. Montre-toi chaque jour.",
    "Le seul mauvais entrainement est celui que tu n as pas fait.",
    "Sois plus fort que tes excuses.",
    "Repousse tes limites. Decouvre qui tu es vraiment.",
    "La sueur d aujourd hui est la victoire de demain.",
    "Ton seul concurrent, c est la version d hier de toi-meme.",
    "Fais-le maintenant. Parfois plus tard devient jamais."
  ],
  "creative": [
    "La creativite, c est l intelligence qui s amuse. — Einstein",
    "Tout ce que tu peux imaginer est reel. — Pablo Picasso",
    "La creativite prend du courage. — Henri Matisse",
    "L art est la maniere dont l ame parle au monde.",
    "Cree ce que tu veux voir dans le monde.",
    "L inspiration existe, mais elle doit te trouver en train de travailler. — Picasso",
    "Chaque artiste trempe son pinceau dans sa propre ame. — Henry Ward Beecher",
    "La perfection est l ennemie du bien. — Voltaire",
    "Ose etre different. Le monde a besoin de ta vision unique.",
    "Les grandes oeuvres naissent de petits commencements.",
    "Cree avec passion, partage avec courage.",
    "L art ne reproduit pas le visible, il rend visible. — Paul Klee",
    "Chaque creation est une conversation avec l univers.",
    "Le talent, c est avoir envie de faire quelque chose. — Jules Renard",
    "Fais de ta vie une oeuvre d art."
  ],
  "organization": [
    "Pour chaque minute passee a organiser, une heure est gagnee. — Benjamin Franklin",
    "L ordre est la cle de toutes les portes. — Victor Hugo",
    "Un objectif sans plan n est qu un souhait. — Antoine de Saint-Exupery",
    "La discipline est choisir entre ce que tu veux maintenant et ce que tu veux le plus.",
    "Organise-toi ou sois organise par les autres.",
    "Le secret du succes est la constance dans l objectif. — Benjamin Disraeli",
    "Commence par faire ce qui est necessaire, puis ce qui est possible. — Francois d Assise",
    "Mieux vaut faire que parfaire.",
    "Les petites actions quotidiennes construisent les grands resultats.",
    "La productivite n est jamais un accident. C est le resultat d un engagement envers l excellence.",
    "Fais aujourd hui ce que les autres ne veulent pas faire. Vis demain comme les autres ne peuvent pas vivre.",
    "Le temps est la ressource la plus precieuse. Utilise-le avec sagesse.",
    "Chaque tache accomplie est un pas vers ton objectif.",
    "La cle n est pas de prioriser ce qui est dans ton agenda, mais de planifier tes priorites.",
    "Sois le directeur de ta vie, pas juste un acteur."
  ]
}

export function getDailyQuote(goalId, dateStr) {
  const list = QUOTES[goalId] || QUOTES.homework
  const seed = parseInt(dateStr.replace(/-/g, "").slice(-3))
  return list[seed % list.length]
}
