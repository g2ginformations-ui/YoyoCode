import type { ReactNode } from "react";
import type { TailoredCv } from "@/lib/cv";

// Aperçu à l'écran du CV adapté (le PDF reprend la même structure).
// `logo` : logo de l'entreprise affiché en haut à droite, comme dans le PDF (option).
export default function CvPreview({ cv, photo, logo }: { cv: TailoredCv; photo?: string; logo?: ReactNode }) {
  const lists: [string, string[]][] = [
    ["Compétences", cv.skills],
    ["Langues", cv.languages],
    ["Atouts", cv.extras],
  ];
  return (
    <article className="cv-paper">
      {logo}
      <header className="cv-head">
        {photo && <img src={photo} alt="" className="cv-photo" width={72} height={72} />}
        <div>
          <h2>{cv.name}</h2>
          {cv.headline && <p className="cv-headline">{cv.headline}</p>}
          {cv.contact.length > 0 && <p className="cv-contact">{cv.contact.join("  ·  ")}</p>}
        </div>
      </header>
      {cv.summary && (
        <section>
          <h3>Profil</h3>
          <p>{cv.summary}</p>
        </section>
      )}
      {cv.experiences.length > 0 && (
        <section>
          <h3>Expérience professionnelle</h3>
          {cv.experiences.map((exp, i) => (
            <div key={i} className="cv-item">
              <div className="cv-line">
                <strong>{exp.role || exp.company}</strong>
                {exp.dates && <span>{exp.dates}</span>}
              </div>
              {(exp.role ? [exp.company, exp.place] : [exp.place]).filter(Boolean).length > 0 && (
                <p className="cv-where">{(exp.role ? [exp.company, exp.place] : [exp.place]).filter(Boolean).join(" · ")}</p>
              )}
              <ul>
                {exp.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      {cv.education.length > 0 && (
        <section>
          <h3>Formation</h3>
          {cv.education.map((edu, i) => (
            <div key={i} className="cv-item">
              <div className="cv-line">
                <strong>{edu.degree || edu.school}</strong>
                {edu.dates && <span>{edu.dates}</span>}
              </div>
              {edu.degree && edu.school && <p className="cv-where">{edu.school}</p>}
            </div>
          ))}
        </section>
      )}
      {lists.map(([title, items]) =>
        items.length ? (
          <section key={title}>
            <h3>{title}</h3>
            <p>{items.join("  ·  ")}</p>
          </section>
        ) : null,
      )}
    </article>
  );
}
