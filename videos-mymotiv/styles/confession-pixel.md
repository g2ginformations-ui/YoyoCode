# Style : confession-pixel

Mesuré le 16/10/2026 (méthode de la compétence `steal`) sur une vidéo de référence envoyée par le propriétaire : un
créateur « avoue » un problème avec l'IA (2 min 14,9), illustré par des icônes en pixel rose sur fond gris (ni son nom,
ni ses phrases, ni ses images, ni ses affirmations ne sont repris). Appliqué dans la composition `Confession` (2 min 15),
briques `src/pixelRose.tsx`. Les règles de `CLAUDE.md` passent avant ce fichier.

## Construction (même découpage, à la seconde près)
1. 0-4,6 s : la confession en une phrase (« J'ai un très gros problème »), une icône seule au centre.
2. 4,6-17,8 s : le contexte (l'IA rend tout facile → tout se ressemble), exemples montrés dans des « écrans » (Crt).
3. 17,8-29,6 s : le retournement personnel (« et moi, je vends justement ça »).
4. 29,6-49 s : qui je suis (vrai parcours, un mot rose par titre), puis la précaution « c'est mon avis » et la boucle
   ouverte « reste jusqu'à la fin ».
5. 49-81 s : pourquoi les gens l'utilisent (le temps, la page blanche), puis ce qu'ils perdent, démonstration côte à côte.
6. 81-109,5 s : la vraie question, la liste POUR / CONTRE (sans musique rythmée), l'avis du créateur.
7. 109,5 s-fin : « j'arrête ? » → « non, je fais l'inverse » → la phrase qui résume → l'appel à commenter → la phrase
   d'honnêteté finale, scintillement, le cadre rétrécit vers le logo.

## Mesures
- Coupes (`scdet`) : 4,6 · 11,2 · 16,5 · 17,8 · 29,6 · 44,8 · 49 · 51,8 · 81,2 · 85,7 · 96,9 · 106,1 · 109,5 s.
  Entre deux coupes, tout bouge par apparitions (rebond) et disparitions d'icônes : une idée = une icône.
- Fond gris anthracite `#2C2A2C`, trame de points fine, vignette ; icônes pixel en 3 roses + contour sombre, légère
  lueur rose ; titre en haut (y ≈ 400), mots qui arrivent un à un, mot fort en ROSE MAJUSCULE ; sous-titres blancs
  dans le tiers bas.
- Exemples dans un écran arrondi façon vieux téléviseur (lignes, halo rose, petit glitch à l'entrée et à la sortie).
- Musique : piano lent et triste (mineur) tant que c'est le problème, passage en majeur à la décision ; presque rien
  sous la liste POUR / CONTRE.
- Fin de la référence : écran de sortie TikTok, NON reproduit (on finit sur notre logo et la signature sonore).

## Briques (`src/pixelRose.tsx`)
- `PixelEmoji` / `Icone` : n'importe quel émoji dessiné en tout petit sur un canevas, puis recoloré en pixels roses
  (bons : 👤 🗓️ 🤖 🤔 💡 👀 ⏱️ 🌙 🧠 🫶 ❌ ❓ ✅ ✍️ 😔 ⏳ 🚀 🔧 🪄 📋 👥 ✨ 💌 🔍 🤝 ; mauvais : ✉️, 🧽).
- `FondGris`, `Titre` (morceaux `[texte, rose?]`), `Crt` (l'écran déformé).

## Adaptation MyMotiv (honnête)
- Aucune étude ni aucun chiffre sur l'IA : « c'est mon avis » ; aucun fournisseur d'IA nommé (assistant générique).
- La liste POUR / CONTRE finit par « je vends une IA : mon avis est forcément un peu biaisé ».
- L'exemple « Camille » vient de la vraie capture du site (réponse d'IA simulée) : « le vrai site », jamais « en direct ».
- Dernière phrase vraie : « cette vidéo a été faite avec de l'IA (la voix), mais l'histoire, c'est la mienne ».
- Appel : « commente GO », annoncé dès 45 s (« reste jusqu'à la fin »), « si toi aussi… » (identité), 1re lettre
  offerte (réciprocité) ; le propriétaire répond en DM avec `yoyo-code.vercel.app/candidature`.
