"use client";

import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Examples from "@/components/Examples";
import Partners from "@/components/Partners";
import Reviews from "@/components/Reviews";
import { clearDraft, readDraft, saveDraft } from "@/lib/draft";
import { getEntry, saveEntry } from "@/lib/history";
import { CHEAPEST_LABEL, PLANS, type PlanId, isPlanId } from "@/lib/pricing";
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
    setLoading(true);
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import impossible.");
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
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
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
  const [letter, setLetter] = useState("");
  const [adjust, setAdjust] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
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
        setLetter(draft.letter ?? "");
        setHistoryId(draft.historyId ?? null);
      }
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const timer = setTimeout(() => saveDraft({ cv, offer, length, instructions, letter, historyId }), 400);
    return () => clearTimeout(timer);
  }, [draftReady, cv, offer, length, instructions, letter, historyId]);

  function resetForm() {
    if (!window.confirm("Vider le CV, l'offre et la lettre en cours ? (vos lettres restent dans « Mes lettres »)")) return;
    setCv("");
    setOffer("");
    setInstructions("");
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
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, offer, length, instructions, ...payload }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        if (data.paywall || data.limit) refreshAccess();
        throw new Error(data.error || "La génération a échoué.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "La génération a échoué.");
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
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lettre-de-motivation.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const canGenerate = cv.trim().length > 0 && offer.trim().length > 0 && !busy;

  return (
    <main>
      <nav className="topbar">
        {access?.loggedIn ? (
          <>
            <Link href="/conseils">Conseils</Link>
            <Link href="/historique">Mes lettres</Link>
            <Link href="/compte">Mon compte</Link>
          </>
        ) : (
          <>
            <Link href="/conseils">Conseils</Link>
            <Link href="/historique">Mes lettres</Link>
            <Link href="/abonnement">Tarifs</Link>
            <Link href="/connexion">Se connecter</Link>
          </>
        )}
      </nav>

      <header className="hero">
        <h1>Lettre IA</h1>
        <p>Votre CV d'un côté, l'offre de l'autre : une lettre de motivation précise, personnelle et sans blabla.</p>
        {access?.trialAvailable && <p className="trial-badge">Votre première lettre est offerte, sans inscription ni carte bancaire.</p>}
      </header>

      {purchase && <p className="banner">{PURCHASE_MESSAGES[purchase]}</p>}

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
        <label className="field grow">
          <span className="label">Consignes (facultatif)</span>
          <input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ex. : insister sur mon expérience en gestion d'équipe, ton plus formel…"
            maxLength={1000}
          />
        </label>
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
              <span>✅ Vos documents ne sont pas conservés sur nos serveurs : votre CV reste privé.</span>
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
              {steps.map((s, i) => (
                <li key={s} className={i === steps.length - 1 ? "current" : "done"}>
                  {STEP_LABELS[s]}
                </li>
              ))}
            </ol>
          )}
          {error && <p className="error">{error}</p>}
          {letter && (
            <>
              <div className="result-head">
                <h2>Votre lettre</h2>
                <div className="actions">
                  <button onClick={copy} disabled={busy}>{copied ? "Copié ✓" : "Copier"}</button>
                  <button onClick={download} disabled={busy}>Télécharger</button>
                </div>
              </div>
              <textarea
                className="letter"
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
      </footer>
    </main>
  );
}
