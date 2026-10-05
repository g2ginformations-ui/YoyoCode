import type { Metadata } from "next";
import { googleEnabled } from "@/lib/oauth";
import Parcours from "./Parcours";
import "./parcours.css";

// Page test du parcours « Lancer une candidature » (questionnaire, analyse, score, offres).
// Non indexée tant qu'elle n'a pas été validée.
export const metadata: Metadata = {
  title: "Lancer une candidature — MyMotiv",
  robots: { index: false, follow: false },
};

export default function Candidature() {
  return <Parcours google={googleEnabled()} />;
}
