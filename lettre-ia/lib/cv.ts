// CV adapté à une offre : structure commune au serveur (génération) et au navigateur (aperçu, PDF).
// L'IA ne fait que trier, raccourcir et reformuler ce qui figure dans le CV : rien n'est inventé.

export type CvExperience = { role: string; company: string; place: string; dates: string; bullets: string[] };
export type CvEducation = { degree: string; school: string; dates: string };

export type TailoredCv = {
  name: string;
  headline: string;
  contact: string[];
  summary: string;
  experiences: CvExperience[];
  education: CvEducation[];
  skills: string[];
  languages: string[];
  extras: string[];
};

export const CV_SYSTEM = `Tu es un recruteur qui met en forme des CV. À partir du CV réel d'un candidat et d'une offre d'emploi, tu produis la version de ce CV la plus pertinente pour CETTE offre, tenant sur une seule page A4.

Règles non négociables :
- N'invente rien : aucune expérience, mission, chiffre, outil, diplôme, date, compétence ou langue absent du CV. Tu peux seulement choisir, ordonner, raccourcir et reformuler ce qui y figure.
- Reprends le vocabulaire de l'offre quand il décrit fidèlement une expérience réelle du candidat.
- Mets en premier les expériences et les preuves qui répondent aux besoins de l'offre ; résume ou retire ce qui n'aide pas cette candidature.
- Puces courtes (une ligne si possible), qui commencent par un verbe d'action, avec les chiffres présents dans le CV.
- Garde les coordonnées telles qu'elles figurent dans le CV (n'en ajoute aucune).
- Français, sauf si l'offre est rédigée dans une autre langue.`;

export function cvPrompt(cv: string, offer: string): string {
  return `<cv>
${cv}
</cv>

<offre>
${offer}
</offre>

Réponds uniquement avec un objet JSON valide (sans texte autour, sans bloc de code), de la forme :
{
  "name": "Prénom Nom",
  "headline": "intitulé visé, aligné sur l'offre et fidèle au parcours (max 70 caractères)",
  "contact": ["e-mail", "téléphone", "ville", "lien LinkedIn ou portfolio"],
  "summary": "2 phrases maximum : qui est le candidat et ce qu'il apporte pour ce poste",
  "experiences": [{ "role": "", "company": "", "place": "", "dates": "", "bullets": ["", ""] }],
  "education": [{ "degree": "", "school": "", "dates": "" }],
  "skills": ["compétences et outils réellement présents dans le CV, les plus utiles pour l'offre d'abord"],
  "languages": ["Anglais (B2)"],
  "extras": ["centres d'intérêt, permis, bénévolat… seulement s'ils servent la candidature"]
}

Pour tenir sur une page : 4 expériences maximum, 2 à 4 puces par expérience (moins pour les plus anciennes), 3 formations maximum, 12 compétences maximum. Laisse un champ vide ("" ou []) quand l'information n'est pas dans le CV.`;
}

const LIMITS = { text: 300, short: 120, list: 14, bullets: 5, experiences: 5, education: 4 };

function clean(value: unknown, max = LIMITS.short): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function list(value: unknown, max = LIMITS.list, len = LIMITS.short): string[] {
  return Array.isArray(value) ? value.map((v) => clean(v, len)).filter(Boolean).slice(0, max) : [];
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

// Réponse de l'IA → CV propre : champs bornés, types vérifiés, rien d'autre ne passe.
export function sanitizeCv(raw: unknown): TailoredCv | null {
  const data = record(raw);
  const cv: TailoredCv = {
    name: clean(data.name, 80),
    headline: clean(data.headline, 90),
    contact: list(data.contact, 6, 90),
    summary: clean(data.summary, 420),
    experiences: (Array.isArray(data.experiences) ? data.experiences : [])
      .map((e) => {
        const exp = record(e);
        return {
          role: clean(exp.role),
          company: clean(exp.company),
          place: clean(exp.place, 60),
          dates: clean(exp.dates, 40),
          bullets: list(exp.bullets, LIMITS.bullets, 220),
        };
      })
      .filter((e) => e.role || e.company)
      .slice(0, LIMITS.experiences),
    education: (Array.isArray(data.education) ? data.education : [])
      .map((e) => {
        const edu = record(e);
        return { degree: clean(edu.degree), school: clean(edu.school), dates: clean(edu.dates, 40) };
      })
      .filter((e) => e.degree || e.school)
      .slice(0, LIMITS.education),
    skills: list(data.skills, 14, 50),
    languages: list(data.languages, 6, 50),
    extras: list(data.extras, 5, 90),
  };
  return cv.name || cv.experiences.length ? cv : null;
}

// Le JSON est parfois entouré d'un bloc de code ou d'une phrase : on garde l'objet seul.
export function parseCvJson(text: string): TailoredCv | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return sanitizeCv(JSON.parse(text.slice(start, end + 1)));
  } catch {
    return null;
  }
}

// Exemple affiché (flouté) aux visiteurs sans offre illimitée : même candidat fictif que les exemples de lettres.
export const SAMPLE_CV: TailoredCv = {
  name: "Lucas Morel",
  headline: "Futur consultant en recrutement — développement commercial B2B",
  contact: ["lucas.morel@exemple.fr", "06 00 00 00 00", "Lyon", "linkedin.com/in/exemple"],
  summary:
    "Commercial B2B depuis deux ans, habitué à gérer un portefeuille de TPE et PME de A à Z. Je souhaite mettre cette relation client au service du recrutement.",
  experiences: [
    {
      role: "Commercial B2B",
      company: "Distrilyon Pro",
      place: "Lyon Est",
      dates: "2025 — aujourd'hui",
      bullets: [
        "Suivi d'un portefeuille d'environ 120 TPE et PME",
        "15 à 20 rendez-vous qualifiés par semaine, sur le terrain et au téléphone",
        "38 nouveaux comptes ouverts, 112 % de l'objectif de chiffre d'affaires",
      ],
    },
    {
      role: "Commercial en alternance",
      company: "Rhône Bureautique Services",
      place: "Lyon",
      dates: "2023 — 2025",
      bullets: ["Prospection terrain, phoning et e-mailing", "22 contrats signés en autonomie, CRM tenu à jour"],
    },
  ],
  education: [{ degree: "BTS Négociation et digitalisation de la relation client", school: "Lyon", dates: "2023 — 2025" }],
  skills: ["Prospection B2B", "Négociation", "Gestion de portefeuille", "Salesforce", "HubSpot"],
  languages: ["Anglais (B2)"],
  extras: ["Permis B"],
};
