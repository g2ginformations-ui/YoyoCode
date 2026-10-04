"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Menu « hamburger » en haut à droite, sur téléphone uniquement (masqué par le CSS sur ordinateur).
export default function MobileMenu({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Fermeture au toucher en dehors du menu ou avec la touche Échap.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="mobile-menu" ref={root}>
      <button
        type="button"
        className="burger"
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      {open && (
        <nav id="menu-mobile" className="mobile-menu-panel" aria-label="Menu">
          <Link href="/conseils" onClick={close}>Conseils</Link>
          <Link href="/historique" onClick={close}>Mes lettres</Link>
          <Link href="/abonnement" onClick={close}>Tarifs</Link>
          <Link href={loggedIn ? "/compte" : "/connexion"} onClick={close} className="menu-account">
            {loggedIn ? "Mon compte" : "Se connecter"}
          </Link>
          <hr />
          <Link href="/createur" onClick={close}>Découvrir le créateur</Link>
          <Link href="/ia" onClick={close}>Utilisation de l'IA</Link>
          <Link href="/cgv" onClick={close}>CGV</Link>
          <Link href="/confidentialite" onClick={close}>Confidentialité</Link>
          <Link href="/mentions-legales" onClick={close}>Mentions légales</Link>
        </nav>
      )}
    </div>
  );
}
