import type { CSSProperties } from "react";

// Mini CV et lettres de motivation qui émergent autour du titre à l'ouverture de la page, puis flottent.
// Purement décoratif (aria-hidden), en CSS seulement : aucune image à charger.
type Doc = { kind: "cv" | "lettre" | "moderne"; x: string; y: string; r: number; w: number; delay: number; float: number };

const DOCS: Doc[] = [
  { kind: "cv", x: "3%", y: "6%", r: -7, w: 150, delay: 0.05, float: 6.5 },
  { kind: "lettre", x: "12%", y: "54%", r: 5, w: 124, delay: 0.25, float: 7.5 },
  { kind: "moderne", x: "19%", y: "2%", r: -3, w: 96, delay: 0.45, float: 8 },
  { kind: "lettre", x: "80%", y: "5%", r: 8, w: 140, delay: 0.15, float: 7 },
  { kind: "cv", x: "87%", y: "47%", r: -5, w: 128, delay: 0.35, float: 6.8 },
  { kind: "moderne", x: "78%", y: "76%", r: 4, w: 96, delay: 0.55, float: 7.8 },
  { kind: "cv", x: "-1%", y: "66%", r: 6, w: 110, delay: 0.65, float: 8.4 },
];

function Lines({ n, short = [] as number[] }: { n: number; short?: number[] }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <i key={i} className={short.includes(i) ? "short" : undefined} />
      ))}
    </>
  );
}

export default function HeroDocs() {
  return (
    <div className="hero-docs" aria-hidden="true">
      {DOCS.map((d, i) => (
        <div
          key={i}
          className={`hero-doc hd-${d.kind} d${i}`}
          style={{ left: d.x, top: d.y, width: d.w, "--r": `${d.r}deg`, "--delay": `${d.delay}s`, "--float": `${d.float}s` } as CSSProperties}
        >
          {d.kind === "cv" ? (
            <>
              <div className="hd-head">
                <span className="hd-photo" />
                <span className="hd-name">
                  <i />
                  <i className="short accent" />
                </span>
                <span className="hd-logo" />
              </div>
              <b className="hd-title" />
              <Lines n={4} short={[1, 3]} />
              <b className="hd-title" />
              <Lines n={3} short={[2]} />
            </>
          ) : (
            <>
              <div className="hd-head">
                <span className="hd-label">{d.kind === "moderne" ? "" : "Lettre"}</span>
                <span className="hd-logo" />
              </div>
              <Lines n={7} short={[2, 6]} />
              <span className="hd-sign" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
