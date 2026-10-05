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

// Vidéos MyMotiv (format TikTok 9:16, 30 images par seconde).
export const Root: React.FC = () => (
  <>
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
