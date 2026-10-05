// Personnages vectoriels (vue de face) : Léo (méthode classique, gris) et Inès (MyMotiv, rose).
// Poses : « desk » (assis devant l'ordinateur), « phone » (téléphone en main), « walk » (marche vers la caméra).
import React from "react";

export type Mood = "neutral" | "sad" | "happy" | "determined";
export type Pose = "desk" | "phone" | "walk" | "stand";
export type Look = { skin: string; hair: string; top: string; topDark: string; hairStyle: "short" | "long" | "bun"; accent: string; glasses?: boolean };
export const LEO: Look = { skin: "#d9b39a", hair: "#3b2f2a", top: "#5b5b64", topDark: "#45454d", hairStyle: "short", accent: "#8a8a94" };
export const ROCHE: Look = { skin: "#e8c2a4", hair: "#6b4a3a", top: "#2f3a52", topDark: "#232c3f", hairStyle: "bun", accent: "#c9d2e6", glasses: true };
export const INES: Look = { skin: "#b9805f", hair: "#24181a", top: "#D9828B", topDark: "#b8646e", hairStyle: "long", accent: "#F2B8C0" };

// t : temps (s) pour le clignement des yeux et les petits mouvements ; phoneGlow : lueur de l'écran du téléphone.
export const Persona: React.FC<{ look: Look; x: number; y: number; scale: number; mood: Mood; pose: Pose; t: number; typing?: boolean; phoneShake?: number; laptopLogo?: boolean; opacity?: number }> = ({ look, x, y, scale, mood, pose, t, typing, phoneShake = 0, laptopLogo, opacity = 1 }) => {
  const blink = (t % 3.1) < 0.12 ? 0.15 : 1;
  const breathe = Math.sin(t * 2.2) * 3;
  const brow = mood === "sad" ? 14 : mood === "determined" ? -12 : mood === "happy" ? 6 : 0; // inclinaison des sourcils
  const mouth = mood === "sad" ? "M -26 -66 Q 0 -90 26 -66" : mood === "happy" ? "M -34 -84 Q 0 -36 34 -84 Z" : mood === "determined" ? "M -24 -76 Q 0 -66 24 -78" : "M -22 -76 L 22 -76";
  const lookDown = pose === "phone" ? 8 : pose === "desk" ? 4 : 0;
  const walk = pose === "walk" ? Math.sin(t * 9) : 0;
  const tap = typing ? Math.sin(t * 38) : 0;
  return (
    <svg width={600 * scale} height={1000 * scale} viewBox="-300 -400 600 1000" style={{ position: "absolute", left: x - 300 * scale, top: y - 400 * scale, overflow: "visible", opacity }}>
      <g transform={`translate(0 ${breathe + (pose === "walk" ? Math.abs(walk) * -10 : 0)})`}>
        {/* cheveux longs (derrière la tête) */}
        {look.hairStyle === "long" && <path d="M -118 -150 Q -125 -255 0 -258 Q 125 -255 118 -150 L 128 40 Q 0 70 -128 40 Z" fill={look.hair} />}
        {look.hairStyle === "bun" && <circle cx={0} cy={-250} r={52} fill={look.hair} />}
        {/* jambes (marche) */}
        {(pose === "walk" || pose === "stand") && (
          <g>
            <rect x={-95} y={400 - walk * 18} width={78} height={300 + walk * 30} rx={36} fill="#2b2a33" />
            <rect x={17} y={400 + walk * 18} width={78} height={300 - walk * 30} rx={36} fill="#2b2a33" />
            <ellipse cx={-56} cy={705 + walk * 12} rx={58} ry={26} fill="#f2f2f4" />
            <ellipse cx={56} cy={705 - walk * 12} rx={58} ry={26} fill="#f2f2f4" />
          </g>
        )}
        {/* bras (marche : balancement) */}
        {(pose === "walk" || pose === "stand") && (
          <g>
            <g transform={`rotate(${8 + walk * 14} -150 40)`}><rect x={-190} y={30} width={66} height={330} rx={33} fill={look.topDark} /><circle cx={-157} cy={370} r={30} fill={look.skin} /></g>
            <g transform={`rotate(${-8 + walk * 14} 150 40)`}><rect x={124} y={30} width={66} height={330} rx={33} fill={look.topDark} /><circle cx={157} cy={370} r={30} fill={look.skin} /></g>
          </g>
        )}
        {/* buste (sweat à capuche) */}
        <path d="M -150 40 Q -150 -6 -92 -14 L 92 -14 Q 150 -6 150 40 L 168 430 L -168 430 Z" fill={look.top} />
        <path d="M -70 -14 Q 0 60 70 -14" fill="none" stroke={look.topDark} strokeWidth={16} strokeLinecap="round" />
        <line x1={-26} y1={30} x2={-30} y2={140} stroke={look.accent} strokeWidth={6} strokeLinecap="round" />
        <line x1={26} y1={30} x2={30} y2={140} stroke={look.accent} strokeWidth={6} strokeLinecap="round" />
        {/* cou + tête */}
        <rect x={-28} y={-52} width={56} height={52} fill={look.skin} />
        <circle cx={0} cy={-132} r={96} fill={look.skin} />
        <ellipse cx={-96} cy={-128} rx={14} ry={22} fill={look.skin} />
        <ellipse cx={96} cy={-128} rx={14} ry={22} fill={look.skin} />
        {look.hairStyle === "bun" ? (
          <path d="M -100 -132 Q -106 -244 0 -244 Q 106 -244 100 -132 Q 60 -206 0 -204 Q -60 -206 -100 -132 Z" fill={look.hair} />
        ) : look.hairStyle === "short" ? (
          <path d="M -100 -140 Q -108 -246 -4 -248 Q 104 -250 100 -140 Q 86 -196 30 -200 Q -40 -214 -100 -140 Z" fill={look.hair} />
        ) : (
          <path d="M -102 -128 Q -110 -246 0 -246 Q 110 -246 102 -128 Q 70 -200 10 -196 Q -30 -170 -102 -128 Z" fill={look.hair} />
        )}
        {/* yeux, sourcils, bouche */}
        <g transform={`translate(0 ${lookDown})`}>
          <ellipse cx={-34} cy={-128} rx={10} ry={13 * blink} fill="#1b1416" />
          <ellipse cx={34} cy={-128} rx={10} ry={13 * blink} fill="#1b1416" />
          <line x1={-56} y1={-162 - brow * 0.2} x2={-16} y2={-162 + brow} stroke={look.hair} strokeWidth={9} strokeLinecap="round" />
          <line x1={56} y1={-162 - brow * 0.2} x2={16} y2={-162 + brow} stroke={look.hair} strokeWidth={9} strokeLinecap="round" />
          {mood === "happy" ? <path d={mouth} fill="#5a1f28" stroke="#5a1f28" strokeWidth={6} strokeLinejoin="round" /> : <path d={mouth} fill="none" stroke="#5a1f28" strokeWidth={8} strokeLinecap="round" />}
          {look.glasses && <g fill="none" stroke="#1b1416" strokeWidth={6}><circle cx={-36} cy={-128} r={26} /><circle cx={36} cy={-128} r={26} /><line x1={-10} y1={-130} x2={10} y2={-130} /></g>}
          {look.hairStyle === "long" && <><circle cx={-60} cy={-96} r={14} fill="#e0707f" opacity={0.35} /><circle cx={60} cy={-96} r={14} fill="#e0707f" opacity={0.35} /></>}
        </g>
        {/* téléphone tenu à deux mains */}
        {pose === "phone" && (
          <g transform={`translate(${phoneShake * Math.sin(t * 90) * 6} 0)`}>
            <path d="M -150 60 Q -175 200 -60 210" fill="none" stroke={look.topDark} strokeWidth={62} strokeLinecap="round" />
            <path d="M 150 60 Q 175 200 60 210" fill="none" stroke={look.topDark} strokeWidth={62} strokeLinecap="round" />
            <rect x={-56} y={86} width={112} height={196} rx={20} fill={look.hairStyle === "long" ? "#2a1d22" : "#26262c"} stroke={look.hairStyle === "long" ? "#D9828B" : "#55555e"} strokeWidth={6} />
            {look.hairStyle === "long" && <circle cx={0} cy={184} r={16} fill="#D9828B" opacity={0.9} />}
            <circle cx={-52} cy={214} r={30} fill={look.skin} />
            <circle cx={52} cy={214} r={30} fill={look.skin} />
          </g>
        )}
      </g>
      {/* bureau + ordinateur (dos de l'écran face à nous) */}
      {pose === "desk" && (
        <g>
          <g transform={`translate(0 ${tap * 3})`}>
            <path d="M -150 60 Q -190 230 -110 300" fill="none" stroke={look.topDark} strokeWidth={60} strokeLinecap="round" />
            <path d="M 150 60 Q 190 230 110 300" fill="none" stroke={look.topDark} strokeWidth={60} strokeLinecap="round" />
          </g>
          <rect x={-230} y={120} width={460} height={250} rx={18} fill={laptopLogo ? "#2a2226" : "#3a3a42"} stroke={laptopLogo ? "#D9828B" : "#4c4c55"} strokeWidth={4} />
          {laptopLogo && <circle cx={0} cy={245} r={30} fill="#D9828B" opacity={0.85} />}
          <rect x={-330} y={366} width={660} height={36} rx={10} fill="#5a4a44" />
          <rect x={-300} y={400} width={600} height={230} fill="#3f342f" />
        </g>
      )}
    </svg>
  );
};
