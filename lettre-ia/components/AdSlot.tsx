"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

// Identifiants Google AdSense, publics par nature (ils apparaissent dans le code de la page).
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Emplacement publicitaire Google AdSense. N'affiche rien tant que les identifiants ne sont pas configurés.
export default function AdSlot() {
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || !SLOT || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Bloqueur de publicité ou script indisponible : on laisse l'emplacement vide.
    }
  }, []);

  if (!CLIENT || !SLOT) return null;

  return (
    <aside className="ad" aria-label="Publicité">
      <span className="ad-label">Publicité</span>
      <Script
        id="adsbygoogle"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
