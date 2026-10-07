import { Composition } from "remotion";
import { CheatCode } from "./CheatCode";
import { CheatCodeLogo } from "./CheatCodeLogo";
import { Sniper } from "./Sniper";
import { Onde } from "./Onde";
import { Duel } from "./Duel";
import { Recruteur } from "./Recruteur";
import { Parcours } from "./Parcours";
import { Pub } from "./Pub";
import { IAHumain } from "./IAHumain";
import { Mascotte, Mascotte2K } from "./Mascotte";
import { Creer } from "./Creer";
import { Lien } from "./Lien";
import { AppleMyMotiv } from "./AppleMyMotiv";
import { ApresMidi } from "./ApresMidi";
import { YannStop } from "./YannStop";
import { AppleKeynote, KEYNOTE_DUR } from "./AppleKeynote";
import { AppleRapide, RAPIDE_DUR } from "./AppleRapide";
import { Reveal, REVEAL_DUR } from "./Reveal";
import { ParcoursSite, PARCOURS_SITE_DUR } from "./ParcoursSite";
import { Express, EXPRESS_DUR } from "./Express";
import { LinkedInPost1 } from "./LinkedInPost1";
import { Fantomes, FANTOMES_DUR } from "./Fantomes";
import { AvantAujourdhui, AVANT_DUR } from "./AvantAujourdhui";
import { ZeroVue, ZERO_VUE_DUR } from "./ZeroVue";
import { TopQI, QI_DUR } from "./TopQI";
import { NEcrisPlus, NECRIS_DUR } from "./NEcrisPlus";
import { NotreHistoire, HISTOIRE_DUR } from "./NotreHistoire";
import { Recherche, RECHERCHE_DUR, Seg as RSeg, segsDuration } from "./Recherche";
import R30 from "./data/recherche30.json";
import yannStop from "./data/yann-stop-phrases.json";
import { Dilemme, type Seg } from "./Dilemme";
import D30 from "./data/dilemme30.json";

// Vidéos MyMotiv (format TikTok 9:16, 30 images par seconde).
export const Root: React.FC = () => (
  <>
    <Composition id="NotreHistoire" component={NotreHistoire} width={1080} height={1920} fps={60} durationInFrames={Math.round(HISTOIRE_DUR * 60)} />
    <Composition id="NEcrisPlus" component={NEcrisPlus} width={1080} height={1920} fps={60} durationInFrames={Math.round(NECRIS_DUR * 60)} />
    <Composition id="TopQI" component={TopQI} width={1080} height={1920} fps={60} durationInFrames={Math.round(QI_DUR * 60)} />
    <Composition id="ZeroVue" component={ZeroVue} width={1080} height={1920} fps={60} durationInFrames={Math.round(ZERO_VUE_DUR * 60)} />
    <Composition id="AvantAujourdhui" component={AvantAujourdhui} width={1080} height={1920} fps={60} durationInFrames={Math.round(AVANT_DUR * 60)} />
    <Composition id="Fantomes" component={Fantomes} width={1080} height={1920} fps={60} durationInFrames={Math.round(FANTOMES_DUR * 60)} />
    <Composition id="FantomesCanette" component={Fantomes} width={1080} height={1920} fps={60} durationInFrames={Math.round(FANTOMES_DUR * 60)} defaultProps={{ canette: true, audio: "audio/fantomes-canette.wav" }} />
    <Composition id="LinkedInPost1" component={LinkedInPost1} width={1080} height={1350} fps={30} durationInFrames={1} />
    <Composition id="Recherche30" component={Recherche} width={1080} height={1920} fps={60} durationInFrames={Math.round(segsDuration(R30.segs as RSeg[]) * 60)} defaultProps={{ segs: R30.segs as RSeg[], audio: "audio/recherche30.wav" }} />
    <Composition id="Recherche" component={Recherche} width={1080} height={1920} fps={60} durationInFrames={Math.round(RECHERCHE_DUR * 60)} />
    <Composition id="Express" component={Express} width={1080} height={1920} fps={60} durationInFrames={Math.round(EXPRESS_DUR * 60)} />
    <Composition id="ParcoursSite" component={ParcoursSite} width={1080} height={1920} fps={60} durationInFrames={Math.round(PARCOURS_SITE_DUR * 60)} />
    <Composition id="Reveal" component={Reveal} width={1080} height={1920} fps={60} durationInFrames={Math.round(REVEAL_DUR * 60)} />
    <Composition id="AppleRapide" component={AppleRapide} width={1080} height={1920} fps={60} durationInFrames={Math.round(RAPIDE_DUR * 60)} />
    <Composition id="AppleKeynote" component={AppleKeynote} width={1080} height={1920} fps={60} durationInFrames={Math.round(KEYNOTE_DUR * 60)} />
    <Composition id="YannStop" component={YannStop} width={1080} height={1920} fps={60} durationInFrames={Math.round(yannStop.duration * 60)} />
    <Composition id="ApresMidi" component={ApresMidi} width={1080} height={1920} fps={60} durationInFrames={Math.round(30.5 * 60)} />
    <Composition id="ApresMidiMusique" component={ApresMidi} width={1080} height={1920} fps={60} durationInFrames={Math.round(30.5 * 60)} defaultProps={{ audio: "audio/apres-midi-musique.wav" }} />
    <Composition id="AppleMyMotiv" component={AppleMyMotiv} width={1080} height={1920} fps={60} durationInFrames={Math.round(10.5 * 60)} />
    <Composition id="Dilemme30" component={Dilemme} width={1080} height={1920} fps={60} durationInFrames={30 * 60} defaultProps={{ segs: D30.segs as Seg[], audio: "audio/dilemme30.wav", direct: true }} />
    <Composition id="Dilemme" component={Dilemme} width={1080} height={1920} fps={60} durationInFrames={50 * 60} />
    <Composition id="Lien" component={Lien} width={1080} height={1920} fps={60} durationInFrames={35 * 60} />
    <Composition id="Creer" component={Creer} width={1080} height={1920} fps={60} durationInFrames={20 * 60} />
    <Composition id="Mascotte2K" component={Mascotte2K} width={1440} height={2560} fps={60} durationInFrames={Math.round(41.5 * 60)} />
    <Composition id="Mascotte" component={Mascotte} width={1080} height={1920} fps={60} durationInFrames={Math.round(41.5 * 60)} />
    <Composition id="IAHumain" component={IAHumain} width={1080} height={1920} fps={60} durationInFrames={25 * 60} />
    <Composition id="Pub" component={Pub} width={1080} height={1920} fps={30} durationInFrames={24 * 30} />
    <Composition id="Parcours" component={Parcours} width={1080} height={1920} fps={30} durationInFrames={36 * 30} />
    <Composition id="Recruteur" component={Recruteur} width={1080} height={1920} fps={30} durationInFrames={30 * 30} />
    <Composition id="Duel" component={Duel} width={1080} height={1920} fps={30} durationInFrames={30 * 30} />
    <Composition id="Onde" component={Onde} width={1080} height={1920} fps={30} durationInFrames={20 * 30} />
    <Composition id="Sniper" component={Sniper} width={1080} height={1920} fps={30} durationInFrames={15 * 30} />
    <Composition id="CheatCodeLogo" component={CheatCodeLogo} width={1080} height={1920} fps={30} durationInFrames={15 * 30} />
    <Composition id="CheatCode" component={CheatCode} width={1080} height={1920} fps={30} durationInFrames={15 * 30} />
  </>
);
