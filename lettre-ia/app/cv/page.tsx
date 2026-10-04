"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CompanyLogo from "@/components/CompanyLogo";
import CvPreview from "@/components/CvPreview";
import { normalizeDomain } from "@/lib/company";
import { SAMPLE_CV, type TailoredCv, sanitizeCv } from "@/lib/cv";
import { downloadCvPdf, preparePhoto } from "@/lib/cv-pdf";
import { readDraft } from "@/lib/draft";
import { CHEAPEST_UNLIMITED_LABEL } from "@/lib/pricing";

// CV adapté et photo restent dans le navigateur : rien n'est conservé sur nos serveurs.
const CV_KEY = "mymotiv:cv";
const PHOTO_KEY = "mymotiv:photo";

function load(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function store(key: string, value: string) {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    // Stockage plein ou indisponible : la donnée vaut seulement pour cette visite.
  }
}

export default function CvPage() {
  const [active, setActive] = useState<boolean | null>(null);
  const [cvText, setCvText] = useState("");
  const [offer, setOffer] = useState("");
  const [company, setCompany] = useState({ name: "", domain: "", logoUrl: "" });
  const [fromDraft, setFromDraft] = useState(false);
  const [photo, setPhoto] = useState("");
  const [showLogo, setShowLogo] = useState(false);
  const [result, setResult] = useState<TailoredCv | null>(null);
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/access")
      .then((res) => res.json())
      .then((data) => setActive(Boolean(data.active)))
      .catch(() => setActive(false));
    // CV et offre repris de la lettre en cours sur la page d'accueil.
    const draft = readDraft();
    if (draft?.cv || draft?.offer) {
      setCvText(draft.cv ?? "");
      setOffer(draft.offer ?? "");
      setFromDraft(true);
    }
    setCompany({
      name: draft?.companyName ?? "",
      domain: normalizeDomain(draft?.companySite ?? ""),
      logoUrl: draft?.offerLogoUrl ?? "",
    });
    setPhoto(load(PHOTO_KEY));
    try {
      setResult(sanitizeCv(JSON.parse(load(CV_KEY) || "null")));
    } catch {
      setResult(null);
    }
  }, []);

  async function choosePhoto(file: File) {
    setError("");
    try {
      const data = await preparePhoto(file);
      setPhoto(data);
      store(PHOTO_KEY, data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Photo illisible.");
    }
  }

  async function generate() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: cvText, offer }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.cv) {
        if (data.paywall) setActive(false);
        throw new Error(data.error || "Le CV n'a pas pu être adapté. Réessayez.");
      }
      setResult(data.cv);
      store(CV_KEY, JSON.stringify(data.cv));
    } catch (e) {
      setError(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Connexion perdue : réessayez.");
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    if (!result) return;
    setPdfBusy(true);
    setError("");
    try {
      await downloadCvPdf(result, {
        photo,
        showLogo,
        logoUrl: company.logoUrl,
        domain: company.domain,
        companyName: company.name,
      });
    } catch (e) {
      console.error(e);
      setError("Le PDF n'a pas pu être créé. Réessayez.");
    } finally {
      setPdfBusy(false);
    }
  }

  const canGenerate = cvText.trim().length > 0 && offer.trim().length > 0 && !busy;
  const hasCompanyLogo = Boolean(company.logoUrl || company.domain);

  return (
    <main className="cv-page">
      <Link href="/" className="back">← Rédiger une lettre</Link>
      <h1 className="title">Mon CV adapté à l'offre</h1>
      <p className="muted lead">
        Votre CV réorganisé pour l'offre visée, sur une seule page, prêt à envoyer avec votre lettre. Rien n'est inventé :
        MyMotiv trie, raccourcit et reformule uniquement ce qui figure dans votre CV.
      </p>

      {active === false && (
        <section className="cv-locked">
          <div className="cv-blur" aria-hidden="true">
            <CvPreview cv={SAMPLE_CV} />
          </div>
          <div className="card cv-unlock">
            <p className="eyebrow">Exemple fictif</p>
            <h2>Débloquez votre CV sur mesure</h2>
            <ul className="features">
              <li>Expériences triées et reformulées selon l'offre</li>
              <li>Une page, mise en page soignée, en PDF</li>
              <li>Photo facultative, gardée sur votre appareil</li>
            </ul>
            <p className="muted small">Inclus dans les offres Semaine, Mois et À vie, avec les lettres illimitées.</p>
            <Link href="/abonnement" className="button primary">Voir les offres — {CHEAPEST_UNLIMITED_LABEL}</Link>
          </div>
        </section>
      )}

      {active && (
        <>
          <section className="grid">
            <label className="card cv-field">
              <h2>1. Votre CV</h2>
              <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} rows={10} placeholder="Collez le texte de votre CV" />
            </label>
            <label className="card cv-field">
              <h2>2. L'offre d'emploi</h2>
              <textarea value={offer} onChange={(e) => setOffer(e.target.value)} rows={10} placeholder="Collez le texte de l'offre" />
            </label>
          </section>
          {fromDraft && <p className="muted small cv-note">CV et offre repris de votre lettre en cours, modifiables.</p>}

          <section className="card cv-options">
            <div className="cv-photo-row">
              {photo ? <img src={photo} alt="Votre photo" className="cv-photo" width={64} height={64} /> : <span className="cv-photo empty" aria-hidden="true" />}
              <div>
                <span className="label">Photo (facultative)</span>
                <div className="actions">
                  <label className="button">
                    {photo ? "Changer" : "Ajouter une photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) choosePhoto(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {photo && (
                    <button type="button" onClick={() => { setPhoto(""); store(PHOTO_KEY, ""); }}>
                      Retirer
                    </button>
                  )}
                </div>
                <span className="muted small">Elle reste sur cet appareil : elle n'est jamais envoyée sur nos serveurs.</span>
              </div>
            </div>
            <label className="consent">
              <input type="checkbox" checked={showLogo} disabled={!hasCompanyLogo} onChange={(e) => setShowLogo(e.target.checked)} />
              <span>
                Afficher le logo de {company.name || "l'entreprise"} en haut à droite{" "}
                <span className="muted small">
                  {hasCompanyLogo
                    ? "(facultatif : certains recruteurs apprécient, d'autres préfèrent un CV neutre)"
                    : "(indiquez le site de l'entreprise sur la page d'accueil pour l'activer)"}
                </span>
              </span>
            </label>
            <button className="primary" disabled={!canGenerate} onClick={generate}>
              {busy ? "Adaptation en cours… (environ 30 secondes)" : result ? "Adapter à nouveau" : "Adapter mon CV à l'offre"}
            </button>
          </section>
        </>
      )}

      {error && <p className="error">{error}</p>}

      {active && result && (
        <section className="card cv-result">
          <div className="result-head">
            <h2>Votre CV adapté</h2>
            <button className="primary" onClick={download} disabled={pdfBusy || busy}>
              {pdfBusy ? "PDF…" : "Télécharger le CV en PDF"}
            </button>
          </div>
          <p className="muted small">
            Relisez-le avant de l'envoyer. Le PDF tient sur une page : si besoin, les puces les moins utiles sont retirées.
          </p>
          <div className="deliverable">
            <CvPreview
              cv={result}
              photo={photo}
              logo={showLogo ? <CompanyLogo logoUrl={company.logoUrl} domain={company.domain} name={company.name} /> : null}
            />
          </div>
        </section>
      )}
    </main>
  );
}
