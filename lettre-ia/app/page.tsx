"use client";

import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Partners from "@/components/Partners";
import { useEffect, useRef, useState } from "react";

type Length = "court" | "standard" | "long";
type Step = "analyse" | "redaction" | "humanisation" | "ajustement";

type Access = { active: boolean; loggedIn: boolean; email: string | null; trialAvailable: boolean };

const STEP_LABELS: Record<Step, string> = {
  analyse: "Analyse du CV et de l'offre",
  redaction: "Rédaction personnalisée",
  humanisation: "Relecture et humanisation",
  ajustement: "Ajustement de la lettre",
};

function DocumentInput({
  title,
  hint,
  value,
  onChange,
}: {
  title: string;
  hint: string;
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
    <section className="card">
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
  const [justPaid, setJustPaid] = useState(false);

  useEffect(() => {
    fetch("/api/access")
      .then((res) => res.json())
      .then(setAccess)
      .catch(() => setAccess({ active: false, loggedIn: false, email: null, trialAvailable: false }));
    if (new URLSearchParams(window.location.search).get("abonnement") === "ok") {
      setJustPaid(true);
      window.history.replaceState(null, "", "/");
    }
  }, []);

  async function run(payload: Record<string, unknown>) {
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
        if (data.paywall) setAccess((a) => ({ loggedIn: false, email: null, ...a, active: false, trialAvailable: false }));
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
            // La lettre offerte est consommée : on bascule sur l'offre d'abonnement.
            if (access && !access.active) {
              fetch("/api/essai", { method: "POST" }).catch(() => {});
              setAccess((a) => (a ? { ...a, trialAvailable: false } : a));
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
            <Link href="/compte">Mon compte</Link>
          </>
        ) : (
          <>
            <Link href="/conseils">Conseils</Link>
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

      {justPaid && (
        <p className="banner">Bienvenue ! Votre abonnement est actif : vous pouvez rédiger autant de lettres que vous voulez.</p>
      )}

      <div className="grid">
        <DocumentInput
          title="1. Votre CV"
          hint="…ou collez le texte de votre CV ici"
          value={cv}
          onChange={setCv}
        />
        <DocumentInput
          title="2. L'offre d'emploi"
          hint="…ou collez le texte de l'annonce ici"
          value={offer}
          onChange={setOffer}
        />
      </div>

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
        {access && !access.active && !access.trialAvailable ? (
          <Link href="/abonnement" className="button primary">
            S'abonner — 19,95 € / mois
          </Link>
        ) : access && !access.active ? (
          <button className="primary" disabled={!canGenerate} onClick={() => run({})}>
            {busy ? "Génération…" : "Essayer gratuitement — 1 lettre offerte"}
          </button>
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
              {access && !access.active ? (
                <div className="upsell">
                  <p>
                    <strong>Cette lettre vous plaît ?</strong> Abonnez-vous pour l'ajuster (plus courte, plus longue,
                    autre ton) et rédiger une lettre pour chaque candidature, sans limite.
                  </p>
                  <Link href="/abonnement" className="button primary">S'abonner — 19,95 € / mois</Link>
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
              <Partners />
            </>
          )}
        </section>
      )}

      {access && !access.active && <AdSlot />}

      <footer>
        Vos documents ne sont pas conservés : ils servent uniquement à rédiger la lettre. ·{" "}
        <Link href="/conseils">Conseils pour votre lettre de motivation</Link>
      </footer>
    </main>
  );
}
