// Zones sûres TikTok (vidéo 1080×1920). En dehors, l'interface de l'appli cache la vidéo : onglets « Suivis / Pour toi »
// en haut, colonne de boutons (j'aime, commentaires, partage) à droite, pseudo + description + musique en bas.
// Tout texte ou élément important reste dans ce rectangle ; texte pixel ≥ 40 px, sous-titres ≥ 56 px (compression TikTok).
export const SAFE = { left: 120, right: 920, top: 280, bottom: 1440 };
export const SAFE_CX = (SAFE.left + SAFE.right) / 2;
