# Pub 3D MyMotiv — prompts Veo 3.1 (5 plans de 8 s, 9:16)

Construction reprise d'une pub 3D de référence (inspiration seulement : ni ses logos, ni ses images, ni ses couleurs).
Maquette animée correspondante : composition `Maquette3D` (`src/Maquette3D.tsx`) → `rendus/maquette-3d.mp4`.

## Méthode (la plus fiable en octobre 2026)
- **Outil** : Google **Veo 3.1** (Gemini → Vidéo, ou Google Flow). Il est le mieux classé pour les pubs, il fait du
  9:16 et accepte jusqu'à **3 images de référence** (mode « Ingredients »), avec 8 s par génération.
  Sora n'existe plus (application fermée en avril 2026, API en septembre 2026).
- **Les IA vidéo écrivent mal les textes** : on leur demande des surfaces **vides**, et les textes exacts (prix,
  « Sur MyMotiv », slogan) sont ajoutés au montage. Remotion le fait au pixel près.
- Générer chaque plan **2 à 4 fois** et garder la meilleure prise.
- Images de référence à joindre (dossier `rendus/refs-pub-3d/`) :
  1. `ref-1-icone-mymotiv.png` : l'icône de l'app ;
  2. `ref-2-ecran-accueil.png` : l'écran d'accueil du vrai site ;
  3. `ref-3-style-*.png` : une image de la maquette pour le style du plan.

---

## Plan 1 — Les pilules 3D (0-8 s)
Joindre : `ref-3-style-pilules.png`

```
9:16 vertical, 8 seconds, premium 3D motion-design commercial, Cinema 4D / Octane look, glossy soft-plastic materials with rounded bevels, soft studio lighting, shallow depth of field, smooth eased camera moves. Bright white-to-light-grey seamless studio background. Use the provided style image for shapes and colors only.
[00:00-00:02] Close-up: a glossy mustard-yellow pill-shaped 3D panel swings in from the upper right while rotating and settles, a tilted square app tile sitting on its right end, three small embossed rounded icon buttons along its lower edge.
[00:02-00:04] A glossy periwinkle-blue pill drops in and stacks just below it, then a mint-green pill, then a soft-grey pill, each with its own tilted square tile on the right end. The camera slowly pulls back.
[00:04-00:06] Wide shot: the four pills form a neat vertical stack in the center, gently bobbing with springy overshoot.
[00:06-00:08] The four pills swing out into a rotating ring formation around the center of frame; the camera tilts up as the ring spins, slight motion blur.
All pill surfaces and tiles stay blank: no letters, no logos, no numbers.
Audio: soft whooshes and light plastic clicks synced to each landing. No music, no voice.
```

## Plan 2 — Les orbes, le flash, l'icône (8 s)
Joindre : `ref-1-icone-mymotiv.png`

```
9:16 vertical, 8 seconds, premium 3D motion-design commercial, glossy materials, cinematic glow.
[00:00-00:03] Pure black void. Four glowing orbs (warm yellow, periwinkle blue, mint green, dusty rose #D9828B) orbit one another and spiral inward, leaving soft light trails.
[00:03-00:04] The orbs collide into a blinding white-and-pink flash that fills the frame.
[00:04-00:08] The flash clears on a pale pink background with rotating radial sunburst rays in alternating dusty rose (#D9828B) and light pink (#F2B8C0). The app icon from the provided reference image flips 180 degrees on its vertical axis and lands center frame with a springy bounce; small glossy golden 3D stars tumble outward around it.
Keep the icon exactly as in the reference: rounded square, rose gradient, white "mm." lettering. No other text.
Audio: rising shimmer, a deep impact on the flash, a sparkle on the stars. No music, no voice.
```

## Plan 3 — Le téléphone et le grand mot 3D (8 s)
Joindre : `ref-2-ecran-accueil.png` + `ref-3-style-telephone.png`

```
9:16 vertical, 8 seconds, premium 3D motion-design commercial, glossy materials, soft studio light.
Background: concentric rings in dusty rose (#D9828B), light pink (#F2B8C0) and white, slowly breathing. Behind the center stands a giant extruded 3D word "MYMOTIV" in rose-tinted matte plastic with deep bevelled sides.
[00:00-00:02] A sleek black smartphone enters edge-on and rotates 90 degrees to face the camera, its screen showing the provided website screenshot.
[00:02-00:05] The phone sways gently, then spins 360 degrees on its vertical axis with motion blur and stops facing the camera.
[00:05-00:08] The camera swoops into a low-angle close-up as the phone tilts back about 45 degrees; four glossy rounded 3D tiles (two white, one rose, one black) pop out of the screen toward the camera one after another.
The tiles stay blank. Keep the phone screen content identical to the reference.
Audio: whooshes on each rotation, soft pops on the tiles. No music, no voice.
```
Si le mot « MYMOTIV » sort déformé, régénérer sans la phrase « Behind the center… » : je l'ajoute au montage.

## Plan 4 — La galerie sous projecteur (8 s)
Joindre : `ref-3-style-galerie.png`

```
9:16 vertical, 8 seconds, premium 3D motion-design commercial, dramatic studio lighting.
[00:00-00:01] A dark charcoal studio wall. A single overhead spotlight switches on with a hard white cone of light from the top center.
[00:01-00:08] A horizontal carousel of tall rounded 3D cards slides right to left in four smooth steps. Each card has a dark navy body, a colored top half (rose, periwinkle, lavender, orange) holding one glossy 3D icon (a document, a sparkle, a paint palette, a target), three thin curved pink light-lines on the lower right, and an empty rose pill button at the bottom. The card under the spotlight is sharp and bright; its neighbors fall into blur and shadow; subtle motion blur on each slide.
No text, no letters, no logos on the cards.
Audio: a heavy light-switch clack at the start, a soft whoosh on each slide. No music, no voice.
```

## Plan 5 — Les rubans et le piédestal (8 s)
Joindre : `ref-1-icone-mymotiv.png`

```
9:16 vertical, 8 seconds, premium 3D motion-design commercial, glossy materials, dramatic spotlight.
[00:00-00:01] Diagonal ribbons in dusty rose, black and white sweep across the frame at high speed as a wipe transition.
[00:01-00:03] Reveal a dark charcoal studio with an overhead spotlight cone; a glossy white cylindrical pedestal rises from below into the light.
[00:03-00:05] The app icon from the provided reference image drops from above and lands on top of the pedestal with a soft bounce.
[00:05-00:08] Slow push-in; the icon gently rotates a few degrees and a rim light glints across its glossy surface. Keep empty space in the top third of the frame for a title.
Keep the icon exactly as in the reference. No other text.
Audio: a ribbon whoosh, a low thump when the pedestal stops, a soft landing thud. No music, no voice.
```

---

## Voix off (à enregistrer, ~32 s, calée sur la maquette)
Une demi-seconde de pause à chaque « // ».

> Lettre de stage, d'alternance, de CDI, candidature spontanée… // finies les heures devant la page blanche. //
> Simplifiez-vous la vie avec MyMotiv. //
> Une interface ultra fluide : // collez l'offre, ajoutez votre CV, // et votre lettre est prête en trente secondes. //
> Et ce n'est pas tout ! //
> Votre CV adapté à l'offre, // le logo de l'entreprise, // des ajustements en un clic, // et votre score de matching. //
> Votre première lettre est offerte : lien en bio. //
> Avec MyMotiv, postulez. // Et faites-vous recruter.

## Montage final
Me renvoyer les 5 clips choisis et la voix : j'assemble (Remotion), j'ajoute les titres exacts sur les pilules et
les cartes, « * temps mesuré : 27 à 35 s par lettre », « * styles réservés aux offres illimitées », la musique, les
bruitages et les sous-titres.
