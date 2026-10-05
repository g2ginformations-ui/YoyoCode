import type { Metadata } from "next";
import { googleEnabled } from "@/lib/oauth";
import Parcours from "./Parcours";
import "./parcours.css";

// Parcours « Lancer une candidature » (questionnaire, analyse, score, lettre offerte).
// Non indexée : c'est une étape du parcours, pas une page d'entrée pour les moteurs de recherche.
export const metadata: Metadata = {
  title: "Lancer une candidature — MyMotiv",
  robots: { index: false, follow: false },
};

export default function Candidature() {
  return <Parcours google={googleEnabled()} />;
}
