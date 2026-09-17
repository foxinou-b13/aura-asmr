export const MOCK_POSTS = [];

export const TRIGGER_CATEGORIES = [
  { id: "all", label: "Tous les vocaux", icon: "✨", count: "0" },
  { id: "mouth", label: "Bruits de Bouche", icon: "👄", count: "0" },
  { id: "sleep", label: "Sommeil & Nuit", icon: "💤", count: "0" },
  { id: "tapping", label: "Tapping & Boisé", icon: "🪵", count: "0" },
  { id: "whispers", label: "Chuchotements", icon: "🎙️", count: "0" },
  { id: "care", label: "Soins & Attention", icon: "💆", count: "0" }
];

export const AMBIENT_CHANNELS = [
  { id: "rain", name: "Pluie d'été", icon: "🌧️", defaultVol: 0.7, defaultPan: -0.2, desc: "Gouttes régulières apaisantes" },
  { id: "tapping", name: "Tapping Binaural", icon: "🪵", defaultVol: 0.5, defaultPan: 0.4, desc: "Percussions douces 3D" },
  { id: "whisper", name: "Souffle & Chuchotis", icon: "💨", defaultVol: 0.4, defaultPan: -0.5, desc: "Respiration et brume de coton" },
  { id: "waves", name: "Roulis des Vagues", icon: "🌊", defaultVol: 0.6, defaultPan: 0.1, desc: "Marée basse nocturne" },
  { id: "fire", name: "Crackle de Cheminée", icon: "🔥", defaultVol: 0.45, defaultPan: 0.3, desc: "Braises chaudes et feutrées" },
  { id: "bowl", name: "Bol Tibétain 432 Hz", icon: "🥣", defaultVol: 0.3, defaultPan: 0.0, desc: "Harmoniques de relaxation" }
];

export const SOUNDBOARD_PRESETS = [
  { id: "cozy-night", name: "Nuit Sous la Couette 🛏️", volumes: { rain: 0.75, whisper: 0.45, fire: 0.5, tapping: 0.0, waves: 0.0, bowl: 0.0 } },
  { id: "zen-spa", name: "Sanctuaire Spa & Bain 🧖", volumes: { bowl: 0.6, waves: 0.5, whisper: 0.3, rain: 0.2, tapping: 0.0, fire: 0.0 } },
  { id: "deep-focus", name: "Concentration & Étude 📚", volumes: { rain: 0.8, tapping: 0.35, fire: 0.2, whisper: 0.0, waves: 0.0, bowl: 0.0 } },
  { id: "tingles-burst", name: "Frissons & Tapping 360° ✨", volumes: { tapping: 0.85, whisper: 0.6, bowl: 0.2, rain: 0.0, waves: 0.0, fire: 0.0 } }
];

export const VIP_PERKS = [
  {
    title: "Écoute Continue & Enchaînement Automatique",
    desc: "Enchaîne tous les vocaux de la communauté sans interruption pour dormir sans toucher à ton téléphone.",
    icon: "🎧",
    tag: "Essentiel Sommeil"
  },
  {
    title: "Qualité Audio HD 320 kbps (Lossless Binaural)",
    desc: "Perçois chaque souffle, chaque grain sonore et la spatialisation 3D avec une pureté cristalline.",
    icon: "💎",
    tag: "Haute Fidélité"
  },
  {
    title: "Mise en Avant Garantie de tes Vocaux",
    desc: "Tes créations apparaissent en haut du fil d'actualité avec la bordure dorée VIP et l'aura lumineuse.",
    icon: "✨",
    tag: "Visibilité x10"
  },
  {
    title: "Accès Exclusif aux Salons & Vocaux VIP",
    desc: "Débloque les enregistrements privés des meilleurs créateurs et les sessions longues inédites.",
    icon: "🔒",
    tag: "Contenu Secret"
  },
  {
    title: "Zéro Publicité & Zéro Coupure",
    desc: "Une expérience 100% feutrée, calme et sans aucune distraction.",
    icon: "🛡️",
    tag: "Tranquillité Pure"
  },
  {
    title: "Badge VIP Diamant Animé",
    desc: "Affiche ton statut d'exception sur ton profil, tes messages et à côté de chacune de tes publications.",
    icon: "👑",
    tag: "Prestige"
  }
];
