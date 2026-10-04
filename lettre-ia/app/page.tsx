"use client";

import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Examples from "@/components/Examples";
import MobileMenu from "@/components/MobileMenu";
import NavIcon from "@/components/NavIcon";
import Partners from "@/components/Partners";
import PenIntro from "@/components/PenIntro";
import Reviews from "@/components/Reviews";
import { copyText } from "@/lib/clipboard";
import { detectCompanyDomain, detectCompanyName, normalizeDomain } from "@/lib/company";
import { clearDraft, readDraft, saveDraft } from "@/lib/draft";
import { downloadLetterPdf } from "@/lib/pdf";
import { getEntry, saveEntry } from "@/lib/history";
import { CHEAPEST_LABEL, PLANS, type PlanId, isPlanId } from "@/lib/pricing";
import { MAX_FILE_BYTES, MAX_FILE_LABEL } from "@/lib/upload";
import { useEffect, useRef, useState } from "react";

type Length = "court" | "standard" | "long";
type Step = "analyse" | "redaction" | "humanisation" | "ajustement";

type Access = {
  active: boolean;
  loggedIn: boolean;
  email: string | null;
  trialAvailable: boolean;
  plan: PlanId | null;
  credits: number;
  adjustLeft: number;
  weekLeft: number;
  ai?: "mistral" | "claude";
};

const NO_ACCESS: Access = {
  active: false,
  loggedIn: false,
  email: null,
  trialAvailable: false,
  plan: null,
  credits: 0,
  adjustLeft: 0,
  weekLeft: 0,
};

// Message affiché au retour de Stripe, selon l'offre achetée.
const PURCHASE_MESSAGES: Record<PlanId, string> = {
  letter: `Paiement confirmé : votre lettre est disponible, avec ${PLANS.letter.features[1]}.`,
  week: "Bienvenue ! Votre accès illimité à la semaine est actif.",
  month: "Bienvenue ! Votre abonnement mensuel est actif : rédigez autant de lettres que vous voulez.",
  lifetime: "Merci ! Votre accès à vie est actif : rédigez autant de lettres que vous voulez.",
};

// Message d'erreur lisible : les erreurs techniques du navigateur (réseau, réponse illisible) sont traduites.
function readableError(error: unknown, fallback = "La génération a échoué. Réessayez dans un instant."): string {
  if (error instanceof TypeError) return "Connexion impossible : vérifiez votre réseau et réessayez.";
  if (error instanceof Error && !(error instanceof SyntaxError) && error.message) return error.message;
  return fallback;
}

// Étapes prévues, affichées dès le départ pour montrer où en est la rédaction.
const WRITE_STEPS: Step[] = ["analyse", "redaction", "humanisation"];
const ADJUST_STEPS: Step[] = ["ajustement"];

const STEP_LABELS: Record<Step, string> = {
  analyse: "Analyse du CV et de l'offre",
  redaction: "Rédaction personnalisée",
  humanisation: "Relecture et humanisation",
  ajustement: "Ajustement de la lettre",
};

function DocumentInput({
  title,
  hint,
  variant,
  value,
  onChange,
}: {
  title: string;
  hint: string;
  variant: "cv" | "offer";
  value: string;
  onChange: (text: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    setError("");
    if (file.size > MAX_FILE_BYTES) {
      setError(`Fichier trop volumineux (${MAX_FILE_LABEL} maximum) : collez plutôt le texte.`);
      return;
    }
    setLoading(true);
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.text !== "string") {
        throw new Error(data.error || "Import impossible : collez plutôt le texte.");
      }
      onChange(data.text);
    } catch (e) {
      setError(readableError(e, "Import impossible : collez plutôt le texte."));
      setFileName("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`card doc doc-${variant}`}>
      <h2>{title}</h2>
      <div
        className={`dropzone${dragging ? " dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          inputRef.current?.click();
        }}
        aria-label={`${title} : importer un fichier PDF, DOCX ou TXT`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <strong>{loading ? "Lecture en cours…" : fileName || "Importer un fichier"}</strong>
        <span>PDF, DOCX ou TXT — glissez-déposez ou cliquez</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint}
        aria-label={title}
        rows={10}
      />
      {error && <p className="error">{error}</p>}
    </section>
  );
}

export default function Home() {
  const [cv, setCv] = useState("");
  const [offer, setOffer] = useState("");
  const [length, setLength] = useState<Length>("standard");
  const [instructions, setInstructions] = useState("");
  const [availability, setAvailability] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companySite, setCompanySite] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  // Sur téléphone, consignes et disponibilité sont repliées pour raccourcir la page.
  const [extrasOpen, setExtrasOpen] = useState(false);
  // Site de l'entreprise saisi à la main : on ne le remplace plus par celui trouvé dans l'offre.
  const companySiteEdited = useRef(false);
  const companyNameEdited = useRef(false);
  const [letter, setLetter] = useState("");
  const [adjust, setAdjust] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [plannedSteps, setPlannedSteps] = useState<Step[]>(WRITE_STEPS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [access, setAccess] = useState<Access | null>(null);
  const [purchase, setPurchase] = useState<PlanId | null>(null);
  const [reviewInvite, setReviewInvite] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);
  // Entrée d'historique de la lettre affichée : les ajustements et retouches la mettent à jour.
  const [historyId, setHistoryId] = useState<string | null>(null);
  // Le brouillon n'est enregistré qu'après avoir été relu, pour ne pas l'écraser au chargement.
  const [draftReady, setDraftReady] = useState(false);

  function refreshAccess() {
    fetch("/api/access")
      .then((res) => res.json())
      .then(setAccess)
      .catch(() => setAccess(NO_ACCESS));
  }

  useEffect(() => {
    refreshAccess();
    const params = new URLSearchParams(window.location.search);
    const bought = params.get("achat");
    if (isPlanId(bought) || params.get("abonnement") === "ok") {
      setPurchase(isPlanId(bought) ? bought : "month");
      window.history.replaceState(null, "", "/");
    }
    // « Reprendre » depuis l'historique : on recharge la lettre, le CV et l'offre.
    const fromHistory = params.get("lettre");
    if (fromHistory) {
      const entry = getEntry(fromHistory);
      if (entry) {
        setCv(entry.cv);
        setOffer(entry.offer);
        setLetter(entry.letter);
        setHistoryId(entry.id);
      }
      window.history.replaceState(null, "", "/");
    } else {
      // Retour sur la page : on remet ce qui avait été saisi en dernier.
      const draft = readDraft();
      if (draft) {
        setCv(draft.cv ?? "");
        setOffer(draft.offer ?? "");
        if (draft.length === "court" || draft.length === "standard" || draft.length === "long") setLength(draft.length);
        setInstructions(draft.instructions ?? "");
        setAvailability(draft.availability ?? "");
        if (draft.instructions || draft.availability) setExtrasOpen(true);
        setCompanyName(draft.companyName ?? "");
        setCompanySite(draft.companySite ?? "");
        companyNameEdited.current = (draft.companyName ?? "") !== detectCompanyName(draft.offer ?? "");
        companySiteEdited.current = (draft.companySite ?? "") !== detectCompanyDomain(draft.offer ?? "");
        setLetter(draft.letter ?? "");
        setHistoryId(draft.historyId ?? null);
      }
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const timer = setTimeout(() => saveDraft({ cv, offer, length, instructions, availability, companyName, companySite, letter, historyId }), 400);
    return () => clearTimeout(timer);
  }, [draftReady, cv, offer, length, instructions, availability, companyName, companySite, letter, historyId]);

  // Le site de l'entreprise est repéré dans l'offre (liens, adresses e-mail), sauf s'il a été saisi à la main.
  useEffect(() => {
    if (!draftReady) return;
    if (!companySiteEdited.current) setCompanySite(detectCompanyDomain(offer));
    if (!companyNameEdited.current) setCompanyName(detectCompanyName(offer));
  }, [draftReady, offer]);

  function resetForm() {
    if (!window.confirm("Vider le CV, l'offre et la lettre en cours ? (vos lettres restent dans « Mes lettres »)")) return;
    setCv("");
    setOffer("");
    setInstructions("");
    setAvailability("");
    setCompanyName("");
    setCompanySite("");
    companySiteEdited.current = false;
    companyNameEdited.current = false;
    setLetter("");
    setAdjust("");
    setHistoryId(null);
    setError("");
    clearDraft();
  }

  // Les retouches faites à la main dans la lettre sont enregistrées (avec un court délai).
  useEffect(() => {
    if (!historyId || !letter || busy) return;
    const timer = setTimeout(() => saveEntry({ id: historyId, letter, cv, offer }), 800);
    return () => clearTimeout(timer);
  }, [letter, historyId, busy, cv, offer]);

  async function run(payload: Record<string, unknown>) {
    // La lettre offerte ne sert que si aucune offre payée ne couvre cette génération.
    const usingTrial = Boolean(access && !access.active && access.credits === 0 && access.trialAvailable && !payload.adjust);
    setBusy(true);
    setError("");
    setSteps([]);
    setPlannedSteps(payload.adjust ? ADJUST_STEPS : WRITE_STEPS);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, offer, length, instructions, availability, company: companyName, ...payload }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        if (data.paywall || data.limit) refreshAccess();
        throw new Error(data.error || "La génération a échoué.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === "step") setSteps((s) => [...s, event.step]);
          if (event.type === "done") {
            finished = true;
            setLetter(event.letter);
            // Nouvelle lettre = nouvelle entrée ; un ajustement met à jour l'entrée en cours.
            setHistoryId(
              saveEntry({ id: payload.adjust ? historyId ?? undefined : undefined, letter: event.letter, cv, offer }),
            );
            // La lettre offerte est consommée ; les crédits et l'usage de la semaine sont relus.
            if (usingTrial) {
              setAccess((a) => (a ? { ...a, trialAvailable: false } : a));
              setReviewInvite(true);
              fetch("/api/essai", { method: "POST" })
                .catch(() => {})
                .finally(() => {
                  refreshAccess();
                  setReviewsKey((k) => k + 1);
                });
            } else {
              refreshAccess();
            }
          }
          if (event.type === "error") throw new Error(event.message);
        }
      }
      // Réponse coupée avant la fin (connexion perdue, délai dépassé) : on le dit au lieu de ne rien afficher.
      if (!finished) throw new Error("La rédaction a été interrompue (connexion perdue ou délai dépassé). Réessayez.");
    } catch (e) {
      setError(readableError(e));
    } finally {
      setBusy(false);
      setSteps([]);
    }
  }

  function requestAdjust(text: string) {
    if (!text.trim() || !letter) return;
    run({ letter, adjust: text });
    setAdjust("");
  }

  async function copy() {
    if (!(await copyText(letter))) {
      setError("Copie impossible sur ce navigateur : sélectionnez le texte de la lettre pour le copier.");
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function downloadPdf() {
    setPdfBusy(true);
    setError("");
    try {
      await downloadLetterPdf(letter, normalizeDomain(companySite), companyName);
    } catch (e) {
      console.error(e);
      setError("Le PDF n'a pas pu être créé. Réessayez, ou copiez la lettre.");
    } finally {
      setPdfBusy(false);
    }
  }

  const canGenerate = cv.trim().length > 0 && offer.trim().length > 0 && !busy;

  return (
    <main>
      <header className="site-header">
        <div className="hero-title">
          <h1 className="logo">
            <span aria-hidden="true">mymotiv.</span>
            <span className="sr-only">MyMotiv</span>
          </h1>
          <PenIntro />
        </div>
        <MobileMenu loggedIn={Boolean(access?.loggedIn)} />
        <nav className="topbar">
          <Link href="/conseils">
            <NavIcon name="conseils" />
            Conseils
          </Link>
          <Link href="/historique">
            <NavIcon name="lettres" />
            Mes lettres
          </Link>
          {access?.loggedIn ? (
            <Link href="/compte" className="nav-account">
              <NavIcon name="compte" />
              Mon compte
            </Link>
          ) : (
            <>
              <Link href="/abonnement">
                <NavIcon name="tarifs" />
                Tarifs
              </Link>
              <Link href="/connexion" className="nav-account">
                <NavIcon name="compte" />
                Se connecter
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <p>Votre CV d'un côté, l'offre de l'autre : une lettre de motivation précise, personnelle et sans blabla.</p>
        {access?.trialAvailable && (
          <p className="trial-badge">
            Votre lettre en 5 clics : la première est offerte, sans inscription ni carte bancaire.
          </p>
        )}
      </section>

      {purchase && (
        <p className="banner">
          {PURCHASE_MESSAGES[purchase]} <Link href="/compte#mot-de-passe">Créez votre mot de passe</Link> pour vous
          reconnecter facilement sur un autre appareil.
        </p>
      )}

      <div className="grid">
        <DocumentInput
          title="1. Votre CV"
          hint="…ou collez le texte de votre CV ici"
          variant="cv"
          value={cv}
          onChange={setCv}
        />
        <DocumentInput
          title="2. L'offre d'emploi"
          hint="…ou collez le texte de l'annonce ici"
          variant="offer"
          value={offer}
          onChange={setOffer}
        />
      </div>

      {offer.trim() && (
        <div className="company-row">
          <label>
            <span>Entreprise</span>
            <input
              value={companyName}
              onChange={(e) => {
                companyNameEdited.current = true;
                setCompanyName(e.target.value);
              }}
              placeholder="Nom de l'entreprise"
              maxLength={80}
            />
          </label>
          <label>
            <span>Site web (logo du PDF)</span>
            <input
              value={companySite}
              onChange={(e) => {
                companySiteEdited.current = true;
                setCompanySite(e.target.value);
              }}
              placeholder="ex. entreprise.fr"
              maxLength={120}
            />
          </label>
          <span className="muted small">Repérés dans l'offre, modifiables.</span>
        </div>
      )}

      {(cv || offer || letter) && (
        <div className="form-tools">
          <span className="muted small">Votre saisie est gardée sur cet appareil si vous changez de page.</span>
          <button type="button" className="link-button" onClick={resetForm} disabled={busy}>
            Vider les champs
          </button>
        </div>
      )}

      <section className="card options">
        <div className="field">
          <span className="label">Longueur</span>
          <div className="segmented" role="radiogroup" aria-label="Longueur">
            {(["court", "standard", "long"] as Length[]).map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={length === l}
                className={length === l ? "active" : ""}
                onClick={() => setLength(l)}
              >
                {l === "court" ? "Courte" : l === "standard" ? "Standard" : "Longue"}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="extras-toggle"
          aria-expanded={extrasOpen}
          aria-controls="options-facultatives"
          onClick={() => setExtrasOpen((open) => !open)}
        >
          <span>Options facultatives</span>
          <span className="muted small">consignes, disponibilité</span>
        </button>
        {/* Sur ordinateur, ce bloc est transparent pour la mise en page : les champs restent sur la ligne. */}
        <div id="options-facultatives" className={`options-extra${extrasOpen ? " open" : ""}`}>
          <label className="field grow">
            <span className="label">Consignes (facultatif)</span>
            <input
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ex. : insister sur mon expérience en gestion d'équipe, ton plus formel…"
              maxLength={1000}
            />
          </label>
          <label className="field availability">
            <span className="label">Disponibilité (facultatif)</span>
            <input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="Ex. : immédiate, dès mars…"
              maxLength={120}
            />
          </label>
        </div>
        {access && !access.active && access.credits > 0 ? (
          <button className="primary" disabled={!canGenerate} onClick={() => run({})}>
            {busy
              ? "Génération…"
              : `Générer ma lettre — ${access.credits} lettre${access.credits > 1 ? "s" : ""} disponible${access.credits > 1 ? "s" : ""}`}
          </button>
        ) : access && !access.active && !access.trialAvailable ? (
          <Link href="/abonnement" className="button primary">
            Voir les offres — {CHEAPEST_LABEL}
          </Link>
        ) : access && !access.active ? (
          // Enveloppe : l'infobulle reste visible au survol même quand le bouton est désactivé.
          <span className="tooltip-wrap">
            <button
              className="primary"
              disabled={!canGenerate}
              onClick={() => run({})}
              aria-describedby="essai-infos"
            >
              {busy ? "Génération…" : "Essayer gratuitement — 1 lettre offerte"}
            </button>
            <span id="essai-infos" role="tooltip" className="tooltip">
              <span>✅ Gratuit, sans inscription ni carte bancaire.</span>
              <span>
                {access.ai === "mistral"
                  ? "✅ Vos documents ne sont pas conservés sur nos serveurs."
                  : "✅ Vos documents ne sont pas conservés sur nos serveurs : votre CV reste privé."}
              </span>
            </span>
          </span>
        ) : (
          <button className="primary" disabled={!canGenerate} onClick={() => run({})}>
            {busy && !letter ? "Génération…" : letter ? "Régénérer la lettre" : "Générer ma lettre"}
          </button>
        )}
      </section>

      {(busy || error || letter) && (
        <section className="card result">
          {busy && (
            <ol className="steps" aria-live="polite">
              {plannedSteps.map((s) => {
                const reached = steps.indexOf(s);
                const state = reached === -1 ? "todo" : reached === steps.length - 1 ? "current" : "done";
                return (
                  <li key={s} className={state}>
                    {STEP_LABELS[s]}
                  </li>
                );
              })}
            </ol>
          )}
          {error && <p className="error">{error}</p>}
          {letter && (
            <>
              <div className="result-head">
                <h2>Votre lettre</h2>
                <div className="actions">
                  <button onClick={copy} disabled={busy}>{copied ? "Copié ✓" : "Copier"}</button>
                  <button onClick={downloadPdf} disabled={busy || pdfBusy}>
                    {pdfBusy ? "PDF…" : "Télécharger en PDF"}
                  </button>
                </div>
              </div>
              <textarea
                className="letter"
                aria-label="Votre lettre (modifiable)"
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                rows={20}
                disabled={busy}
              />
              {access && !access.active && access.adjustLeft > 0 && (
                <p className="muted small">
                  {access.adjustLeft} ajustement{access.adjustLeft > 1 ? "s" : ""} restant
                  {access.adjustLeft > 1 ? "s" : ""} pour cette lettre.
                </p>
              )}
              {access && !access.active && access.adjustLeft === 0 ? (
                <div className="upsell">
                  <p>
                    <strong>Cette lettre vous plaît ?</strong> Choisissez une offre pour l'ajuster (plus courte, plus
                    longue, autre ton) et rédiger une lettre pour chaque candidature.
                  </p>
                  <Link href="/abonnement" className="button primary">Voir les offres — {CHEAPEST_LABEL}</Link>
                </div>
              ) : (
              <div className="adjust">
                <button disabled={busy} onClick={() => requestAdjust("Plus court")}>Plus court</button>
                <button disabled={busy} onClick={() => requestAdjust("Plus long")}>Plus long</button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    requestAdjust(adjust);
                  }}
                >
                  <input
                    value={adjust}
                    onChange={(e) => setAdjust(e.target.value)}
                    placeholder="Demander une modification : « plus chaleureux », « parler du projet X »…"
                    aria-label="Modification demandée"
                    maxLength={1000}
                    disabled={busy}
                  />
                  <button type="submit" className="primary" disabled={busy || !adjust.trim()}>
                    Ajuster
                  </button>
                </form>
              </div>
              )}
              {reviewInvite && (
                <p className="review-invite">
                  Votre lettre offerte vous a aidé ? <a href="#avis">Laissez un avis</a>, cela prend 20 secondes.
                </p>
              )}
              <Partners />
            </>
          )}
        </section>
      )}

      {access && !access.active && <AdSlot />}

      <Examples />

      <Reviews refreshKey={reviewsKey} />

      <footer>
        Vos documents ne sont pas conservés sur nos serveurs : vos lettres restent sur cet appareil. ·{" "}
        <Link href="/conseils">Conseils pour votre lettre de motivation</Link> ·{" "}
        <Link href="/createur">Découvrir le créateur</Link>
        <br />
        <Link href="/mentions-legales">Mentions légales</Link> · <Link href="/cgv">CGV</Link> ·{" "}
        <Link href="/confidentialite">Confidentialité</Link> ·{" "}
        <Link href="/ia">Utilisation de l'IA</Link>
      </footer>
    </main>
  );
}
