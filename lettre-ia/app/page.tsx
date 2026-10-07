"use client";

import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Examples from "@/components/Examples";
import LogoLink from "@/components/LogoLink";
import LiquidButton from "@/components/LiquidButton";
import MobileMenu from "@/components/MobileMenu";
import NavIcon from "@/components/NavIcon";
import Partners from "@/components/Partners";
import HeroDocs from "@/components/HeroDocs";
import PenIntro from "@/components/PenIntro";
import Reviews from "@/components/Reviews";
import CompanyLogo from "@/components/CompanyLogo";
import EliteSheet, { type EliteReason } from "@/components/EliteSheet";
import { copyText } from "@/lib/clipboard";
import { detectCompanyDomain, detectCompanyName, normalizeDomain } from "@/lib/company";
import { clearDraft, readDraft, saveDraft } from "@/lib/draft";
import { PDF_STYLES, type PdfStyle, downloadLetterPdf, isPremiumPdfStyle, readPdfStyle, savePdfStyle } from "@/lib/pdf";
import { getEntry, saveEntry } from "@/lib/history";
import { CHEAPEST_LABEL, PLANS, type PlanId, isPlanId } from "@/lib/pricing";
import ReadingProgress from "@/components/ReadingProgress";
import { MAX_FILE_BYTES, MAX_FILE_LABEL, UPLOAD_ACCEPT, UPLOAD_LABEL, prepareUpload } from "@/lib/upload";
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
  cvLeft?: number;
  weekLeft: number;
  ai?: "mistral" | "claude";
};

const ACCESS_HINT_KEY = "mymotiv:statut";

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
  year: "Bienvenue chez Les Motivés ! Votre abonnement annuel est actif.",
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

type OfferPageInfo = { company: string; domain: string; logoUrl: string };

// Comparaison sans accents ni majuscules, pour repérer un mot-clé dans la lettre.
function fold(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Mots-clés de l'offre relevés par l'analyse ; une coche indique ceux que la lettre reprend.
function KeywordList({ keywords, letter }: { keywords: string[]; letter: string }) {
  if (!keywords.length) return null;
  const text = fold(letter);
  const found = keywords.filter((k) => text && text.includes(fold(k)));
  return (
    <div className="keywords">
      <span className="label">
        {letter
          ? `Mots-clés de l'offre : ${found.length} sur ${keywords.length} repris dans la lettre`
          : "Mots-clés repérés dans l'offre"}
      </span>
      <ul>
        {keywords.map((k) => {
          const hit = found.includes(k);
          return (
            <li key={k} className={hit ? "hit" : ""}>
              {hit && <span aria-hidden="true">✓ </span>}
              {k}
              {letter && <span className="sr-only">{hit ? " (repris)" : " (non repris)"}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DocumentInput({
  title,
  hint,
  variant,
  value,
  onChange,
  onOfferPage,
  addLabel,
}: {
  title: string;
  addLabel: string;
  hint: string;
  variant: "cv" | "offer";
  value: string;
  onChange: (text: string) => void;
  // Offre lue depuis un lien : entreprise, site et logo repérés sur la page.
  onOfferPage?: (page: OfferPageInfo) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  // Un fichier lâché à côté de la zone ne doit pas ouvrir le fichier à la place du site.
  useEffect(() => {
    const stop = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
    };
    window.addEventListener("dragover", stop);
    window.addEventListener("drop", stop);
    return () => {
      window.removeEventListener("dragover", stop);
      window.removeEventListener("drop", stop);
    };
  }, []);

  async function handleFile(original: File) {
    setError("");
    setLoading(true);
    setFileName(original.name);
    const file = await prepareUpload(original);
    if (file.size > MAX_FILE_BYTES) {
      setError(`Fichier trop volumineux (${MAX_FILE_LABEL} maximum) : collez plutôt le texte.`);
      setLoading(false);
      setFileName("");
      return;
    }
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

  async function readUrl() {
    if (!url.trim() || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/offre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.text !== "string") throw new Error(data.error || "Lecture impossible : collez plutôt le texte.");
      setFileName("");
      onChange(data.text);
      onOfferPage?.({ company: data.company ?? "", domain: data.domain ?? "", logoUrl: data.logoUrl ?? "" });
      setUrl("");
    } catch (e) {
      setError(readableError(e, "Lecture impossible : collez plutôt le texte."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`card doc doc-${variant}`}>
      <h2>{title}</h2>
      {onOfferPage && (
        <form
          className={loading ? "url-import loading" : "url-import"}
          onSubmit={(e) => {
            e.preventDefault();
            readUrl();
          }}
        >
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Collez le lien de l'offre (https://…)"
            aria-label="Lien de l'offre d'emploi"
            maxLength={2000}
          />
          <button type="submit" className="primary" disabled={!url.trim() || loading}>
            {loading ? "Lecture…" : "Lire l'offre"}
          </button>
        </form>
      )}
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
        aria-label={`${title} : importer un fichier (${UPLOAD_LABEL})`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={UPLOAD_ACCEPT}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        {loading && fileName ? (
          <ReadingProgress fileName={fileName} photo={/\.(jpe?g|png|webp|heic|heif)$/i.test(fileName)} />
        ) : (
          <>
            <strong>{loading ? "Lecture en cours…" : dragging ? "Déposez le fichier ici" : fileName || addLabel}</strong>
            {!dragging && <span className="drop-hint">Cliquez ou glissez votre fichier ici</span>}
            <span>{UPLOAD_LABEL}</span>
          </>
        )}
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
  // Logo officiel publié avec l'offre (lien lu depuis la page de l'offre), prioritaire sur l'icône du site.
  const [offerLogoUrl, setOfferLogoUrl] = useState("");
  // Recherche du site de l'entreprise quand l'offre ne le donne pas, et confirmation du logo trouvé.
  const [siteLookup, setSiteLookup] = useState<"idle" | "searching" | "done">("idle");
  const [logoFound, setLogoFound] = useState<boolean | null>(null);
  // Mots-clés de l'offre relevés par l'analyse, affichés sous la lettre.
  const [keywords, setKeywords] = useState<string[]>([]);
  // Nombre de « Motivés » (utilisateurs du premier site + nouveaux utilisateurs), affiché sous le bouton.
  const [motives, setMotives] = useState(0);
  useEffect(() => {
    fetch("/api/motives")
      .then((res) => res.json())
      .then((data) => setMotives(Number(data.total) || 0))
      .catch(() => {});
  }, []);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfStyle, setPdfStyle] = useState<PdfStyle>("classique");
  // Style réservé aux offres illimitées sur lequel un visiteur sans offre a cliqué (affiche l'invitation).
  const [lockedStyle, setLockedStyle] = useState<PdfStyle | null>(null);
  // Panneau des offres : ouvert quand le candidat veut une 2e lettre, le CV adapté ou un style de PDF premium.
  const [elite, setElite] = useState<EliteReason | null>(null);
  const [payCancelled, setPayCancelled] = useState(false);
  // Arrivée depuis le parcours /candidature : la lettre est lancée dès que le brouillon et l'accès sont prêts.
  const autoStart = useRef(false);
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
      .then((data: Access) => {
        setAccess(data);
        // Statut gardé sur l'appareil : à la prochaine visite, le bon texte s'affiche dès la première image.
        try {
          window.localStorage.setItem(ACCESS_HINT_KEY, data.trialAvailable ? "essai" : "sans-essai");
          document.documentElement.dataset.statut = data.trialAvailable ? "essai" : "sans-essai";
        } catch {
          // Stockage indisponible : le texte se corrige à la réception du statut.
        }
      })
      .catch(() => setAccess(NO_ACCESS));
  }



  useEffect(() => {
    refreshAccess();
    const params = new URLSearchParams(window.location.search);
    const bought = params.get("achat");
    if (params.get("parcours")) {
      autoStart.current = true;
      window.history.replaceState(null, "", "/#candidature");
    }
    if (params.get("annule")) {
      setPayCancelled(true);
      setElite("lettre");
      window.history.replaceState(null, "", "/");
    }
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
        setOfferLogoUrl(draft.offerLogoUrl ?? "");
        setKeywords(Array.isArray(draft.keywords) ? draft.keywords.filter((k) => typeof k === "string").slice(0, 10) : []);
      }
    }
    setPdfStyle(readPdfStyle());
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const timer = setTimeout(() => saveDraft({ cv, offer, length, instructions, availability, companyName, companySite, letter, historyId, offerLogoUrl, keywords }),
      400,
    );
    return () => clearTimeout(timer);
  }, [draftReady, cv, offer, length, instructions, availability, companyName, companySite, letter, historyId, offerLogoUrl, keywords]);

  // Le site de l'entreprise est repéré dans l'offre (liens, adresses e-mail), sauf s'il a été saisi à la main.
  useEffect(() => {
    if (!draftReady) return;
    if (!companySiteEdited.current) setCompanySite(detectCompanyDomain(offer));
    if (!companyNameEdited.current) setCompanyName(detectCompanyName(offer));
  }, [draftReady, offer]);

  // Nom transmis à la recherche de logo, mis à jour après la frappe (évite une recherche par lettre tapée).
  const [logoName, setLogoName] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setLogoName(companyName.trim()), 800);
    return () => clearTimeout(timer);
  }, [companyName]);
  useEffect(() => setLogoFound(null), [companySite, offerLogoUrl]);

  // L'offre ne contient ni lien ni adresse e-mail de l'entreprise : on cherche son site à partir de son nom.
  useEffect(() => {
    if (!draftReady || companySiteEdited.current || companySite || offerLogoUrl) return;
    const name = companyName.trim();
    if (name.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSiteLookup("searching");
      try {
        const res = await fetch(`/api/entreprise?nom=${encodeURIComponent(name)}`);
        const data = await res.json().catch(() => ({}));
        if (!cancelled && typeof data.domain === "string" && data.domain && !companySiteEdited.current) setCompanySite(data.domain);
      } catch {
        // Recherche impossible : le candidat peut saisir le site à la main.
      } finally {
        if (!cancelled) setSiteLookup("done");
      }
    }, 700);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [draftReady, companyName, companySite, offerLogoUrl]);

  function resetForm() {
    if (!window.confirm("Vider le CV, l'offre et la lettre en cours ? (vos lettres restent dans « Mes lettres »)")) return;
    setCv("");
    setOffer("");
    setInstructions("");
    setAvailability("");
    setCompanyName("");
    setCompanySite("");
    setOfferLogoUrl("");
    setKeywords([]);
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

  useEffect(() => {
    if (!autoStart.current || !draftReady || !access || busy || !cv.trim() || !offer.trim()) return;
    autoStart.current = false;
    if (access.active || access.credits > 0 || access.trialAvailable) {
      run({});
      // La rédaction s'affiche sous le formulaire : on y descend pour la voir avancer.
      setTimeout(() => document.querySelector(".result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } else {
      document.getElementById("candidature")?.scrollIntoView({ behavior: "smooth" });
      setElite("lettre");
    }
    // run() lit l'état courant (CV, offre, consignes) : on ne la relance pas à chaque rendu.
  }, [draftReady, access, busy, cv, offer]);

  async function run(payload: Record<string, unknown>) {
    // La lettre offerte ne sert que si aucune offre payée ne couvre cette génération.
    const usingTrial = Boolean(access && !access.active && access.credits === 0 && access.trialAvailable && !payload.adjust);
    setBusy(true);
    setError("");
    setSteps([]);
    setPlannedSteps(payload.adjust ? ADJUST_STEPS : WRITE_STEPS);
    if (!payload.adjust) setKeywords([]);
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
          if (event.type === "keywords" && Array.isArray(event.keywords)) setKeywords(event.keywords.slice(0, 10));
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
      await downloadLetterPdf(letter, { domain: normalizeDomain(companySite), companyName, style: activeStyle, logoUrl: offerLogoUrl });
    } catch (e) {
      console.error(e);
      setError("Le PDF n'a pas pu être créé. Réessayez, ou copiez la lettre.");
    } finally {
      setPdfBusy(false);
    }
  }

  // Les styles autres que « Classique » sont inclus dans les offres illimitées : sans elles, on revient au classique
  // (y compris si un style choisi pendant un abonnement terminé est resté mémorisé).
  const stylesUnlocked = Boolean(access?.active);
  const activeStyle: PdfStyle = stylesUnlocked || !isPremiumPdfStyle(pdfStyle) ? pdfStyle : "classique";

  // Remplissage du bouton pendant la rédaction d'une lettre (pas pendant un ajustement) : chaque étape
  // occupe une part égale de la barre ; à l'intérieur d'une étape, le liquide avance vite puis ralentit,
  // sans jamais dépasser la fin de l'étape tant qu'elle n'est pas terminée.
  const generating = busy && plannedSteps === WRITE_STEPS;
  const [progress, setProgress] = useState(0);
  const stepStart = useRef({ index: -1, at: 0 });
  // Nouvelle rédaction : le liquide repart de zéro.
  useEffect(() => {
    if (!generating) return;
    stepStart.current = { index: -1, at: 0 };
    setProgress(0);
  }, [generating]);
  useEffect(() => {
    if (!generating) {
      if (progress > 0) {
        setProgress(100);
        const timer = setTimeout(() => setProgress(0), 450);
        return () => clearTimeout(timer);
      }
      return;
    }
    const tick = () => {
      const index = Math.max(0, steps.length - 1);
      if (stepStart.current.index !== index) stepStart.current = { index, at: performance.now() };
      const share = 100 / WRITE_STEPS.length;
      const elapsed = (performance.now() - stepStart.current.at) / 1000;
      const within = 0.92 * (1 - Math.exp(-elapsed / 9));
      setProgress((p) => Math.max(p, index * share + within * share));
    };
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [generating, steps.length]);
  const generatingLabel = `Génération… ${Math.round(progress)} %`;
  // Le liquide reste visible le temps de finir de remplir le bouton (100 %) après la fin.
  const fillVisible = generating || progress > 0;

  const canGenerate = cv.trim().length > 0 && offer.trim().length > 0 && !busy;

  // Bouton collant (téléphone) : apparaît dès que le bouton principal du haut sort de l'écran.
  const heroCtaRef = useRef<HTMLAnchorElement>(null);
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);
  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setHeroCtaVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main id="contenu">
      {!access?.active && (
        <a href="/candidature" className={`button primary sticky-cta${heroCtaVisible ? "" : " shown"}`} aria-hidden={heroCtaVisible} tabIndex={heroCtaVisible ? -1 : 0}>
          {!access || access.trialAvailable ? "Essayer gratuitement" : "Lancer une candidature"}
        </a>
      )}
      {/* Bande collée en haut, sur toute la largeur : rien ne défile visiblement derrière la barre. */}
      <div className="header-band">
      <header className="site-header">
        <div className="hero-title">
          <div className="logo">
            <LogoLink />
          </div>
          <PenIntro />
        </div>
        <nav className="topbar" aria-label="Accès rapide">
          <Link href="/historique">
            <NavIcon name="lettres" />
            Mes lettres
          </Link>
        </nav>
        <MobileMenu loggedIn={Boolean(access?.loggedIn)} />
      </header>
      </div>

      <section className="landing">
        <HeroDocs />
        <div className="landing-content">
          <h1 className="landing-title">
            Générez la candidature <span>qui sort de la pile.</span>
          </h1>
          <p className="landing-sub">
            Une lettre et un CV taillés pour chaque entreprise, avec son logo, en 5 clics. Pas de prompt à écrire, pas
            d'IA qui s'emmêle au fil des conversations : vous collez l'offre, MyMotiv fait le reste.
          </p>
          {/* Parcours guidé (/candidature) pour les visiteurs sans offre illimitée ; les abonnés vont droit à l'outil. */}
          <a
            ref={heroCtaRef}
            href={access?.active ? "#candidature" : "/candidature"}
            className="button primary landing-cta"
          >
            {/* « gratuite » : masqué dès le premier affichage si l'appareil sait que l'essai est déjà utilisé
                (script dans app/layout.tsx), puis selon le vrai statut une fois reçu. */}
            Lancer une candidature
            {(!access || access.trialAvailable) && <span className="cta-free">gratuite</span>}
          </a>
          {motives > 0 && (
            <p className="landing-trust">
              <strong>+{motives.toLocaleString("fr-FR")}</strong> <b className="motives">Motivés</b> nous font déjà
              confiance
            </p>
          )}
        </div>
      </section>

      {/* Volet replié : garanties, chiffre sourcé et comparatif du temps (le hero reste épuré). */}
      <details className="why">
        <summary>
          <span>Pourquoi MyMotiv ?</span>
          <span className="why-hint">Garanties, chiffres et temps gagné</span>
        </summary>
        <div className="why-body">
          <ul className="why-proof">
            {access?.trialAvailable && <li>Première lettre offerte</li>}
            {access?.trialAvailable && <li>Sans inscription ni carte bancaire</li>}
            <li>Rien d'inventé sur votre profil</li>
            <li>Relecture humanisée</li>
          </ul>

          {/* Chiffre sourcé : c'est une opinion des candidats (sondage), pas un taux d'entretien. */}
          <p className="why-stat">
            <strong>88 %</strong> des candidats estiment qu'une lettre personnalisée augmente leurs chances
            d'entretien<sup>1</sup>. MyMotiv la personnalise pour chaque offre.
          </p>

          {/* Temps pour une lettre personnalisée : à la main (source), avec un chatbot (estimation), avec MyMotiv (mesuré). */}
          <div className="compare">
            <h2>Le temps d'une lettre de motivation personnalisée</h2>
            <ol className="compare-list">
              <li>
                <span className="compare-who">À la main</span>
                <strong>Plusieurs heures</strong>
                <span>recherche sur l'entreprise, rédaction, relectures<sup>2</sup></span>
              </li>
              <li>
                <span className="compare-who">Avec un chatbot IA</span>
                <strong>20 à 40 min</strong>
                <span>prompt, vérification des infos, humanisation, mise en page<sup>3</sup></span>
              </li>
              <li className="compare-us">
                <span className="compare-who">Avec MyMotiv</span>
                <strong>27 à 35 s</strong>
                <span>du CV ajouté à la lettre prête, vérifiée et humanisée<sup>4</sup></span>
              </li>
            </ol>
          </div>

          <p className="why-notes">
            <a href="https://www.malettredemotivation.com/actualite/paris-lettre-motivation-essentielle" target="_blank" rel="noopener">
              ¹ Étude citée par malettredemotivation.com
            </a>
            {" · "}
            <a href="https://www.jobmag.ca/combien-de-temps-faut-il-pour-rediger-une-lettre-de-motivation/" target="_blank" rel="noopener">
              ² jobmag.ca
            </a>
            {" · ³ Estimation · ⁴ Temps mesuré sur MyMotiv"}
          </p>
        </div>
      </details>

      {purchase && (
        <p className="banner">
          {PURCHASE_MESSAGES[purchase]} <Link href="/compte#mot-de-passe">Créez votre mot de passe</Link> pour vous
          reconnecter facilement sur un autre appareil.
        </p>
      )}

      <div className="grid" id="candidature">
        <DocumentInput
          title="Votre CV"
          addLabel="Ajouter un CV"
          hint="…ou collez le texte de votre CV ici"
          variant="cv"
          value={cv}
          onChange={setCv}
        />
        <DocumentInput
          title="L'offre d'emploi"
          addLabel="Ajouter une offre d'emploi"
          hint="…ou collez le texte de l'annonce ici"
          variant="offer"
          value={offer}
          onChange={setOffer}
          onOfferPage={(page) => {
            if (page.company) {
              companyNameEdited.current = true;
              setCompanyName(page.company.slice(0, 80));
            }
            if (page.domain) {
              companySiteEdited.current = true;
              setCompanySite(page.domain);
            }
            setOfferLogoUrl(page.logoUrl);
          }}
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
                // Site changé à la main : le logo lu sur la page de l'offre ne correspond peut-être plus.
                setOfferLogoUrl("");
              }}
              placeholder="ex. entreprise.fr"
              maxLength={120}
            />
          </label>
          <span className="company-status small" role="status">
            {(offerLogoUrl || normalizeDomain(companySite)) && (
              <CompanyLogo
                logoUrl={offerLogoUrl}
                domain={normalizeDomain(companySite)}
                name={logoName}
                onResult={setLogoFound}
              />
            )}
            <span>
              {siteLookup === "searching" && !companySite
                ? "Recherche du site de l'entreprise…"
                : !companySite && !offerLogoUrl
                  ? "Site introuvable : indiquez-le pour afficher le logo dans le PDF."
                  : logoFound === false
                    ? "Logo introuvable pour ce site : vérifiez l'adresse."
                    : logoFound
                      ? "✓ Site et logo trouvés (modifiables)."
                      : "Vérification du logo…"}
            </span>
          </span>
        </div>
      )}

      {(cv || offer || letter) && (
        <div className="form-tools">
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
          <LiquidButton filling={fillVisible} progress={progress} disabled={!canGenerate} onClick={() => run({})}>
            {busy
              ? generatingLabel
              : `Générer ma lettre — ${access.credits} lettre${access.credits > 1 ? "s" : ""} disponible${access.credits > 1 ? "s" : ""}`}
          </LiquidButton>
        ) : access && !access.active && !access.trialAvailable ? (
          <button type="button" className="button primary" onClick={() => setElite("lettre")}>
            Voir les offres — {CHEAPEST_LABEL}
          </button>
        ) : access && !access.active ? (
          // Enveloppe : l'infobulle reste visible au survol même quand le bouton est désactivé.
          <span className="tooltip-wrap">
            <LiquidButton
              filling={fillVisible}
              progress={progress}
              disabled={!canGenerate}
              onClick={() => run({})}
              aria-describedby="essai-infos"
            >
              {busy ? generatingLabel : "Essayer gratuitement — 1 lettre offerte"}
            </LiquidButton>
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
          <LiquidButton filling={fillVisible} progress={progress} disabled={!canGenerate} onClick={() => run({})}>
            {generating ? generatingLabel : fillVisible ? "✓ Lettre prête" : letter ? "Régénérer la lettre" : "Générer ma lettre"}
          </LiquidButton>
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
          {busy && !letter && <KeywordList keywords={keywords} letter="" />}
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
              <div className="pdf-style">
                <span className="label" id="style-pdf">Style du PDF</span>
                <div className="segmented" role="radiogroup" aria-labelledby="style-pdf">
                  {PDF_STYLES.map((s) => {
                    const locked = s.premium && !stylesUnlocked;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={activeStyle === s.id}
                        className={[activeStyle === s.id ? "active" : "", locked ? "locked" : ""].join(" ").trim()}
                        title={locked ? `${s.hint} — inclus dans les offres illimitées` : s.hint}
                        onClick={() => {
                          if (locked) {
                            setLockedStyle(s.id);
                            setElite("pdf");
                            return;
                          }
                          setLockedStyle(null);
                          setPdfStyle(s.id);
                          savePdfStyle(s.id);
                        }}
                      >
                        <span className={`swatch swatch-${s.id}`} aria-hidden="true" />
                        {s.label}
                        {locked && (
                          <span className="lock" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor">
                              <path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              {lockedStyle && !stylesUnlocked && (
                <div className="upsell" role="status">
                  <p>
                    <strong>Style « {PDF_STYLES.find((s) => s.id === lockedStyle)?.label} » réservé aux offres illimitées.</strong>{" "}
                    Les 4 styles de PDF sont inclus avec les offres Semaine, Mois et À vie, en plus des lettres et
                    ajustements illimités.
                  </p>
                  <button type="button" className="button primary" onClick={() => setElite("pdf")}>Voir les offres</button>
                </div>
              )}
              {activeStyle === "sombre" && (
                <p className="pdf-warning" role="note">
                  ⚠️ Fond noir : à réserver aux métiers créatifs (design, mode, communication…). Déconseillé si la
                  lettre risque d'être imprimée ou lue par un logiciel de tri des candidatures. Dans le doute, gardez un
                  style sur fond blanc.
                </p>
              )}
              <div className="deliverable">
                {(offerLogoUrl || normalizeDomain(companySite)) && (
                  <div className="letter-badge">
                    <CompanyLogo logoUrl={offerLogoUrl} domain={normalizeDomain(companySite)} name={logoName} />
                    <span>
                      Lettre sur mesure pour <strong>{companyName || normalizeDomain(companySite)}</strong>
                    </span>
                  </div>
                )}
                <textarea
                  className="letter"
                  aria-label="Votre lettre (modifiable)"
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  rows={20}
                  disabled={busy}
                />
              </div>
              <KeywordList keywords={keywords} letter={letter} />
              <Link
                href="/cv"
                className="cv-cta"
                onClick={(e) => {
                  // Le CV adapté est inclus dans les offres illimitées : sans elles, le panneau des offres s'ouvre ici.
                  if (access && !access.active && !((access.cvLeft ?? 0) > 0)) {
                    e.preventDefault();
                    setElite("cv");
                  }
                }}
              >
                Adapter aussi mon CV à cette offre, sur une page →
              </Link>
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
                  <button type="button" className="button primary" onClick={() => setElite("ajuster")}>
                    Voir les offres — {CHEAPEST_LABEL}
                  </button>
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
      {elite && (
        <EliteSheet
          reason={elite}
          from="accueil"
          email={access?.email ?? ""}
          cancelled={payCancelled}
          onClose={() => {
            setElite(null);
            setPayCancelled(false);
          }}
        />
      )}

      <Examples />

      <Reviews refreshKey={reviewsKey} />

      <footer>
        Vos documents ne sont pas conservés sur nos serveurs : vos lettres restent sur cet appareil. ·{" "}
        <Link href="/conseils">Conseils pour votre lettre de motivation</Link> ·{" "}
        <Link href="/actualites">Actualités de l'emploi</Link> ·{" "}
        <Link href="/createur">Découvrir le créateur</Link>
        <br />
        <Link href="/mentions-legales">Mentions légales</Link> · <Link href="/cgv">CGV</Link> ·{" "}
        <Link href="/confidentialite">Confidentialité</Link> ·{" "}
        <Link href="/ia">Utilisation de l'IA</Link>
      </footer>
    </main>
  );
}
