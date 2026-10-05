"use client";

import Link from "next/link";
import EliteSheet from "@/components/EliteSheet";
import { useCallback, useEffect, useRef, useState } from "react";
import { detectCompanyDomain, detectCompanyName } from "@/lib/company";
import { saveDraft } from "@/lib/draft";
import { type Match, matchCvOffer } from "@/lib/match";
import { MAX_FILE_BYTES, MAX_FILE_LABEL } from "@/lib/upload";

// Parcours « Lancer une candidature » : questions courtes, CV, offre, analyse réelle (mots-clés, logo),
// engagement, score de correspondance calculé, puis « Générer ma lettre offerte » : la lettre est rédigée sur la
// page principale, et le panneau des offres n'arrive qu'ensuite (2e lettre, CV adapté, styles de PDF).

type Step = "profil" | "douleur" | "reponse" | "cv" | "offre" | "compte" | "analyse" | "engagement" | "resultat";
const STEPS: Step[] = ["profil", "douleur", "reponse", "cv", "offre", "compte", "analyse", "engagement", "resultat"];

const PROFILES = [
  { id: "etudiant", label: "Étudiant · Stage · Alternance", hint: "Première expérience à décrocher", consigne: "Profil étudiant (stage ou alternance) : valoriser la formation, les projets et la motivation." },
  { id: "junior", label: "Junior", hint: "0 à 2 ans d'expérience", consigne: "Profil junior (0 à 2 ans d'expérience) : valoriser les premières expériences et la capacité à apprendre vite." },
  { id: "confirme", label: "Confirmé", hint: "3 à 7 ans d'expérience", consigne: "Profil confirmé (3 à 7 ans d'expérience) : mettre en avant des réalisations concrètes et l'autonomie." },
  { id: "senior", label: "Senior", hint: "Plus de 8 ans d'expérience", consigne: "Profil senior (plus de 8 ans d'expérience) : mettre en avant l'expertise, le leadership et les résultats." },
] as const;

const PAINS = [
  { id: "reponse", label: "Je n'ai jamais de réponse", consigne: "" },
  { id: "temps", label: "Je perds trop de temps sur les lettres", consigne: "" },
  { id: "valeur", label: "Je ne sais pas me mettre en valeur", consigne: "Mettre clairement en valeur mes points forts et mes réalisations." },
] as const;

const ANALYSIS = [
  "Scan de l'offre",
  "Extraction des compétences requises",
  "Récupération du logo de l'entreprise",
  "Alignement de votre profil avec le poste",
  "Préparation de votre lettre sur-mesure",
];
const ANALYSIS_MS = 5200;
const HOLD_MS = 1500;
const STORE = "mymotiv:parcours";

type State = {
  step: Step;
  profile: string;
  pain: string;
  cv: string;
  cvName: string;
  offerUrl: string;
  offer: string;
  company: string;
  domain: string;
  logoUrl: string;
  firstName: string;
  email: string;
};

const EMPTY: State = {
  step: "profil",
  profile: "",
  pain: "",
  cv: "",
  cvName: "",
  offerUrl: "",
  offer: "",
  company: "",
  domain: "",
  logoUrl: "",
  firstName: "",
  email: "",
};

type Access = { loggedIn: boolean; email: string | null; trialAvailable: boolean; active: boolean; credits: number };

function Mascot({ mood, size = 120 }: { mood: "sourire" | "rire" | "reflexion" | "surprise"; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/mascotte/${mood}.webp`} alt="Yann Motiveur, la mascotte MyMotiv" width={size} height={Math.round(size * 1.5)} className="pc-mascot" />;
}

export default function Parcours({ google }: { google: boolean }) {
  const [s, setS] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  const [access, setAccess] = useState<Access | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pasteOffer, setPasteOffer] = useState(false);
  const [pasteCv, setPasteCv] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [logoOk, setLogoOk] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const update = useCallback((patch: Partial<State>) => setS((prev) => ({ ...prev, ...patch })), []);
  const index = STEPS.indexOf(s.step);
  const go = useCallback((step: Step) => {
    setError("");
    setS((prev) => ({ ...prev, step }));
    window.scrollTo({ top: 0 });
  }, []);
  const next = () => go(STEPS[Math.min(index + 1, STEPS.length - 1)]);
  const back = () => {
    // On ne repasse ni par l'animation d'analyse ni par l'engagement.
    const target = STEPS[Math.max(index - 1, 0)];
    go(target === "analyse" || target === "engagement" ? "compte" : target);
  };

  // Reprise après une connexion Google ou un paiement annulé : le parcours est gardé dans l'onglet.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(STORE) ?? "null") as Partial<State> | null;
      if (saved) setS({ ...EMPTY, ...saved, step: STEPS.includes(saved.step as Step) ? (saved.step as Step) : "profil" });
    } catch {
      // Rien à reprendre.
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("annule")) {
      setCancelled(true);
      setS((prev) => ({ ...prev, step: prev.offer ? "resultat" : prev.step }));
      setSheet(true);
    }
    setReady(true);
    fetch("/api/access")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Access | null) => data && setAccess(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.sessionStorage.setItem(STORE, JSON.stringify(s));
    } catch {
      // Stockage indisponible : le parcours fonctionne quand même, sans reprise.
    }
  }, [ready, s]);

  // Connecté (Google ou compte existant) : l'étape « compte » est déjà faite.
  useEffect(() => {
    if (access?.loggedIn && access.email && !s.email) update({ email: access.email });
  }, [access, s.email, update]);

  useEffect(() => {
    if (s.cv && s.offer) setMatch(matchCvOffer(s.cv, s.offer, s.company));
  }, [s.cv, s.offer, s.company]);

  async function uploadCv(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      setError(`Fichier trop volumineux (${MAX_FILE_LABEL} maximum).`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error ?? "Lecture du fichier impossible.");
      update({ cv: data.text, cvName: file.name });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lecture du fichier impossible.");
      setPasteCv(true);
    } finally {
      setBusy(false);
    }
  }

  async function readOffer() {
    if (pasteOffer && s.offer.trim().length > 200) {
      const domain = s.domain || detectCompanyDomain(s.offer);
      update({ company: s.company || detectCompanyName(s.offer, domain), domain });
      next();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/offre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: s.offerUrl }),
      });
      const data = (await res.json()) as { text?: string; company?: string; domain?: string; logoUrl?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error ?? "Lecture de l'offre impossible.");
      const domain = data.domain || detectCompanyDomain(data.text);
      update({
        offer: data.text,
        company: data.company || detectCompanyName(data.text, domain),
        domain,
        logoUrl: data.logoUrl ?? "",
      });
      next();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lecture de l'offre impossible.");
      setPasteOffer(true);
    } finally {
      setBusy(false);
    }
  }

  // Pendant l'analyse : recherche du site de l'entreprise quand l'offre ne le donne pas (pour son logo).
  useEffect(() => {
    if (s.step !== "analyse" || s.logoUrl || s.domain || s.company.length < 2) return;
    fetch(`/api/entreprise?nom=${encodeURIComponent(s.company)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { domain?: string } | null) => data?.domain && update({ domain: data.domain }))
      .catch(() => {});
  }, [s.step, s.logoUrl, s.domain, s.company, update]);

  const logoSrc = s.logoUrl
    ? `/api/logo?url=${encodeURIComponent(s.logoUrl)}`
    : s.domain
      ? `/api/logo?domain=${encodeURIComponent(s.domain)}&nom=${encodeURIComponent(s.company)}`
      : "";
  useEffect(() => setLogoOk(true), [logoSrc]);

  // Brouillon repris par la page principale : CV, offre, entreprise et consignes issues des réponses.
  function handOver() {
    const consigne = [
      PROFILES.find((p) => p.id === s.profile)?.consigne,
      PAINS.find((p) => p.id === s.pain)?.consigne,
    ]
      .filter(Boolean)
      .join(" ");
    saveDraft({
      cv: s.cv,
      offer: s.offer,
      length: "standard",
      instructions: consigne,
      availability: "",
      companyName: s.company,
      companySite: s.domain,
      letter: "",
      historyId: null,
      offerLogoUrl: s.logoUrl,
      keywords: [],
    });
  }

  if (!ready) return <main className="pc" />;

  const firstName = s.firstName.trim();
  const company = s.company || "l'entreprise";
  const canNext: Record<Step, boolean> = {
    profil: Boolean(s.profile),
    douleur: Boolean(s.pain),
    reponse: true,
    cv: s.cv.trim().length > 80,
    offre: pasteOffer ? s.offer.trim().length > 200 : /\S+\.\S+/.test(s.offerUrl),
    compte: Boolean(access?.loggedIn) || (firstName.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email.trim())),
    analyse: false,
    engagement: false,
    resultat: true,
  };

  // Lettre offerte, crédit ou abonnement : la lettre est rédigée tout de suite sur la page principale.
  // Sinon (lettre offerte déjà utilisée, sans offre), le panneau des offres s'ouvre.
  const canWrite = !access || access.active || access.credits > 0 || access.trialAvailable;
  const freeLetter = Boolean(access && !access.active && access.credits === 0 && access.trialAvailable);
  const write = () => {
    handOver();
    window.location.href = "/?parcours=1#candidature";
  };

  const header = s.step !== "analyse" && (
    <header className="pc-head">
      {index > 0 ? (
        <button type="button" className="pc-icon" onClick={back} aria-label="Étape précédente">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      ) : (
        <Link href="/" className="pc-icon" aria-label="Retour à l'accueil">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      )}
      <div className="pc-bar" role="progressbar" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={index + 1}>
        <span style={{ width: `${((index + 1) / STEPS.length) * 100}%` }} />
      </div>
    </header>
  );

  const nextButton = (label = "Suivant", onClick: () => void = next) => (
    <footer className="pc-foot">
      <button type="button" className="pc-next" disabled={!canNext[s.step] || busy} onClick={onClick}>
        {busy ? <span className="pc-dots" aria-label="Chargement"><i /><i /><i /></span> : label}
      </button>
    </footer>
  );

  return (
    <main className={`pc pc-${s.step}`}>
      {header}

      {s.step === "profil" && (
        <section className="pc-step" key="profil">
          <h1 className="pc-title">Où en êtes-vous dans votre carrière ?</h1>
          <p className="pc-sub">Le ton de votre lettre s'adapte à votre expérience.</p>
          <div className="pc-options">
            {PROFILES.map((p, i) => (
              <button key={p.id} type="button" style={{ animationDelay: `${i * 70}ms` }} className={`pc-option${s.profile === p.id ? " on" : ""}`} onClick={() => update({ profile: p.id })}>
                <strong>{p.label}</strong>
                <span>{p.hint}</span>
              </button>
            ))}
          </div>
          {nextButton()}
        </section>
      )}

      {s.step === "douleur" && (
        <section className="pc-step" key="douleur">
          <h1 className="pc-title">Qu'est-ce qui vous bloque le plus ?</h1>
          <p className="pc-sub">Soyez honnête, c'est ce qu'on va régler en premier.</p>
          <div className="pc-options">
            {PAINS.map((p, i) => (
              <button key={p.id} type="button" style={{ animationDelay: `${i * 70}ms` }} className={`pc-option${s.pain === p.id ? " on" : ""}`} onClick={() => update({ pain: p.id })}>
                <strong>{p.label}</strong>
              </button>
            ))}
          </div>
          {nextButton()}
        </section>
      )}

      {s.step === "reponse" && (
        <section className="pc-step" key="reponse">
          {s.pain === "temps" ? (
            <>
              <h1 className="pc-title">Une lettre sur-mesure, en moins d'une minute.</h1>
              <div className="pc-card pc-compare">
                <p className="pc-card-label">Le temps d'une lettre personnalisée</p>
                <div className="pc-bars">
                  <div className="pc-col"><span className="pc-col-bar" style={{ height: "100%" }} /><strong>Plusieurs heures</strong><em>À la main¹</em></div>
                  <div className="pc-col"><span className="pc-col-bar" style={{ height: "42%" }} /><strong>20 à 40 min</strong><em>Chatbot IA²</em></div>
                  <div className="pc-col us"><span className="pc-col-bar" style={{ height: "6%" }} /><strong>27 à 35 s</strong><em>MyMotiv³</em></div>
                </div>
                <p className="pc-note">¹ jobmag.ca · ² Estimation · ³ Temps mesuré sur MyMotiv</p>
              </div>
            </>
          ) : s.pain === "valeur" ? (
            <>
              <h1 className="pc-title">Vos atouts sont déjà dans votre CV. On les relie à l'offre.</h1>
              <div className="pc-card pc-coach">
                <Mascot mood="sourire" size={92} />
                <ul className="pc-checks">
                  <li>Chaque expérience est rattachée à une attente du poste</li>
                  <li>Rien d'inventé sur votre profil</li>
                  <li>Un ton humain, relu et humanisé</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <h1 className="pc-title">Les lettres génériques finissent dans la pile.</h1>
              <div className="pc-card pc-coach">
                <p className="pc-stat"><strong>88 %</strong> des candidats estiment qu'une lettre personnalisée augmente leurs chances d'entretien¹.</p>
                <ul className="pc-checks">
                  <li>Une lettre écrite pour cette offre, pas pour toutes</li>
                  <li>Les mots-clés du poste, repris naturellement</li>
                  <li>Le logo de l'entreprise sur votre lettre</li>
                </ul>
                <p className="pc-note">¹ Étude citée par malettredemotivation.com : une opinion des candidats, pas un taux d'entretien.</p>
              </div>
            </>
          )}
          {nextButton("C'est parti")}
        </section>
      )}

      {s.step === "cv" && (
        <section className="pc-step" key="cv">
          <h1 className="pc-title">Ajoutez votre CV</h1>
          <p className="pc-sub">PDF, Word ou texte. Une seule fois : il sert pour toutes vos candidatures.</p>
          {s.cv && !pasteCv ? (
            <div className="pc-file">
              <span className="pc-file-icon" aria-hidden="true">✓</span>
              <div>
                <strong>{s.cvName || "CV ajouté"}</strong>
                <span>{s.cv.split(/\s+/).length} mots lus</span>
              </div>
              <button type="button" className="pc-link" onClick={() => update({ cv: "", cvName: "" })}>Changer</button>
            </div>
          ) : (
            <label className={`pc-drop${busy ? " busy" : ""}`}>
              <input type="file" accept=".pdf,.docx,.txt,.md" onChange={(e) => e.target.files?.[0] && uploadCv(e.target.files[0])} disabled={busy} />
              <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M12 16V4m0 0l-5 5m5-5l5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <strong>{busy ? "Lecture du CV…" : "Choisir mon CV"}</strong>
              <span>PDF, DOCX ou TXT · {MAX_FILE_LABEL} max</span>
            </label>
          )}
          {pasteCv ? (
            <textarea className="pc-area" rows={7} placeholder="Collez le texte de votre CV ici" value={s.cv} onChange={(e) => update({ cv: e.target.value, cvName: "" })} />
          ) : (
            !s.cv && <button type="button" className="pc-link center" onClick={() => setPasteCv(true)}>…ou collez le texte de votre CV</button>
          )}
          {error && <p className="pc-error">{error}</p>}
          {nextButton()}
        </section>
      )}

      {s.step === "offre" && (
        <section className="pc-step" key="offre">
          <h1 className="pc-title">Collez le lien de l'offre qui vous fait rêver</h1>
          <p className="pc-sub">Le lien de l'annonce, sur un site d'emploi ou le site carrières de l'entreprise.</p>
          {!pasteOffer && (
            <input className="pc-input" type="url" inputMode="url" placeholder="https://… lien de l'annonce" value={s.offerUrl} onChange={(e) => update({ offerUrl: e.target.value })} onKeyDown={(e) => e.key === "Enter" && canNext.offre && readOffer()} autoFocus />
          )}
          {error && <p className="pc-error">{error}</p>}
          {pasteOffer ? (
            <>
              <textarea className="pc-area" rows={8} placeholder="Collez ici le texte complet de l'annonce" value={s.offer} onChange={(e) => update({ offer: e.target.value, company: "", domain: "", logoUrl: "" })} />
              <button type="button" className="pc-link center" onClick={() => { setPasteOffer(false); setError(""); }}>Utiliser plutôt un lien</button>
            </>
          ) : (
            <button type="button" className="pc-link center" onClick={() => setPasteOffer(true)}>Pas de lien ? Collez le texte de l'annonce</button>
          )}
          {nextButton(busy ? "Lecture de l'offre…" : "Lire l'offre", readOffer)}
        </section>
      )}

      {s.step === "compte" && (
        <section className="pc-step" key="compte">
          <h1 className="pc-title">À qui prépare-t-on ce dossier ?</h1>
          <p className="pc-sub">Votre prénom pour personnaliser, votre e-mail pour retrouver vos lettres.</p>
          {access?.loggedIn ? (
            <div className="pc-file">
              <span className="pc-file-icon" aria-hidden="true">✓</span>
              <div>
                <strong>Connecté</strong>
                <span>{access.email}</span>
              </div>
            </div>
          ) : (
            <>
              {google && (
                <>
                  <a href="/api/auth/google/start?next=/candidature" className="pc-social">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
                      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
                      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
                      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
                    </svg>
                    Continuer avec Google
                  </a>
                  <p className="pc-or"><span>ou</span></p>
                </>
              )}
              <div className="pc-fields">
                <input className="pc-input big" placeholder="Prénom" autoComplete="given-name" value={s.firstName} onChange={(e) => update({ firstName: e.target.value.slice(0, 40) })} />
                <input className="pc-input big" type="email" placeholder="E-mail" autoComplete="email" value={s.email} onChange={(e) => update({ email: e.target.value.slice(0, 200) })} />
              </div>
              <p className="pc-note">Votre compte est créé avec cet e-mail au moment du paiement. Pas de spam.</p>
            </>
          )}
          {nextButton("Analyser ma candidature")}
        </section>
      )}

      {s.step === "analyse" && <Analysis company={s.company} onDone={() => go("engagement")} />}

      {s.step === "resultat" && (
        <section className="pc-step" key="resultat">
          <p className="pc-kicker">● Votre analyse est prête</p>
          <h1 className="pc-title">{firstName ? `${firstName}, voici` : "Voici"} votre candidature pour {company}.</h1>
          <div className="pc-score-card">
            {match ? (
              <>
                <div className="pc-ring" style={{ ["--p" as string]: match.score }}>
                  <strong>{match.score} %</strong>
                  <span>correspondance</span>
                </div>
                <div className="pc-score-text">
                  <strong>Score de matching</strong>
                  <span>{match.found.length} mots-clés de l'offre sur {match.keywords.length} déjà présents dans votre CV.</span>
                </div>
              </>
            ) : (
              <div className="pc-score-text">
                <strong>Offre analysée</strong>
                <span>L'annonce est trop courte pour calculer un score fiable : votre lettre reprendra ses attentes une à une.</span>
              </div>
            )}
          </div>
          {match && (
            <ul className="pc-chips" aria-label="Mots-clés de l'offre">
              {match.keywords.map((k) => (
                <li key={k} className={match.found.includes(k) ? "hit" : ""}>{match.found.includes(k) ? "✓ " : ""}{k}</li>
              ))}
            </ul>
          )}
          <div className="pc-docs">
            <div className="pc-doc">
              <div className="pc-doc-head">
                {logoSrc && logoOk ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoSrc} alt={`Logo ${company}`} onError={() => setLogoOk(false)} />
                ) : (
                  <span className="pc-doc-initial">{company.slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div className="pc-blur" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ width: `${70 + ((i * 37) % 30)}%` }} />)}</div>
              <span className="pc-lock" aria-hidden="true">🔒</span>
              <p>Lettre pour {company}</p>
            </div>
            <div className="pc-doc">
              <div className="pc-blur cv" aria-hidden="true">{s.cv.slice(0, 420)}</div>
              <span className="pc-lock" aria-hidden="true">🔒</span>
              <p>CV adapté à l'offre</p>
            </div>
          </div>
          <div className="pc-bubble">
            <Mascot mood="rire" size={64} />
            <p><b>Yann Motiveur</b> Tout est prêt pour la rédaction. Il ne manque plus que vous.</p>
          </div>
          {canWrite
            ? nextButton(freeLetter ? "Générer ma lettre offerte" : "Générer ma lettre", write)
            : nextButton("Débloquer ma candidature", () => setSheet(true))}
        </section>
      )}

      {s.step === "engagement" && <Commitment firstName={firstName} onDone={next} />}

      {sheet && (
        <EliteSheet
          reason="lettre"
          from="candidature"
          email={s.email.trim()}
          cancelled={cancelled}
          onClose={() => setSheet(false)}
          onBeforePay={handOver}
        />
      )}
    </main>
  );
}

// Écran d'analyse : pourcentage et étapes qui se cochent une à une (5 à 6 secondes).
function Analysis({ company, onDone }: { company: string; onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(now - start, ANALYSIS_MS);
      setElapsed(t);
      if (t < ANALYSIS_MS) frame = requestAnimationFrame(tick);
      else setTimeout(() => done.current(), 450);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const ratio = elapsed / ANALYSIS_MS;
  // Courbe douce : démarre vite, ralentit vers la fin, comme un vrai chargement.
  const percent = Math.round((1 - Math.pow(1 - ratio, 2.2)) * 100);
  const per = ANALYSIS_MS / ANALYSIS.length;
  return (
    <section className="pc-step pc-analysis" key="analyse">
      <div className="pc-load">
        <strong>{percent} %</strong>
        <span>Analyse{company ? ` · ${company}` : ""}…</span>
        <div className="pc-load-bar"><i style={{ width: `${percent}%` }} /></div>
      </div>
      <ul className="pc-load-steps">
        {ANALYSIS.map((label, i) => {
          const state = elapsed >= (i + 1) * per ? "done" : elapsed >= i * per ? "now" : "todo";
          return (
            <li key={label} className={state}>
              <span>{label}{state === "now" ? "…" : ""}</span>
              {state === "done" && <b aria-label="terminé">✓</b>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// « Maintenez pour vous engager » : appui long, l'anneau se remplit, puis « C'est noté ».
function Commitment({ firstName, onDone }: { firstName: string; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const frame = useRef(0);
  const started = useRef(0);

  const stop = () => {
    cancelAnimationFrame(frame.current);
    if (!locked) setProgress(0);
  };
  const start = () => {
    if (locked) return;
    started.current = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - started.current) / HOLD_MS, 1);
      setProgress(p);
      if (p < 1) frame.current = requestAnimationFrame(tick);
      else {
        setLocked(true);
        navigator.vibrate?.(40);
        setTimeout(onDone, 1100);
      }
    };
    frame.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const glow = locked ? 1 : progress;
  return (
    <section className="pc-step pc-commit" key="engagement" style={{ ["--g" as string]: glow }}>
      <div className="pc-commit-top">
        {progress > 0.15 && <p className="pc-bubble-top"><b>De mon côté,</b> je m'engage à écrire chaque lettre pour une seule offre.</p>}
        <Mascot mood={locked ? "rire" : "sourire"} size={110} />
        <p className="pc-kicker center">On s'engage{firstName ? `, ${firstName}` : ""} ?</p>
        <h1 className="pc-quote">« Je postule à <span>au moins</span> 5 offres <span>cette semaine</span> »</h1>
      </div>
      <div className="pc-hold-wrap">
        <p className="pc-hold-label">{locked ? "C'est noté" : "Maintenez pour vous engager"}</p>
        <button
          type="button"
          className={`pc-hold${locked ? " locked" : ""}`}
          style={{ ["--p" as string]: progress }}
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Maintenir pour s'engager"
        >
          <span>{locked ? "✓" : (
            <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path d="M12 11v4m-3.5-6.5a5 5 0 017 0M6 8a8 8 0 0112 0M9 13a3 3 0 016 0v1m-6 2v-3m6 3a8 8 0 01-1 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          )}</span>
        </button>
        {!locked && <button type="button" className="pc-link center" onClick={onDone}>Passer</button>}
      </div>
    </section>
  );
}
