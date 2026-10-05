import { Composition } from "remotion";
import { CheatCode } from "./CheatCode";
import { CheatCodeLogo } from "./CheatCodeLogo";
import { Sniper } from "./Sniper";
import { Onde } from "./Onde";

// Vidéos MyMotiv (format TikTok 9:16, 30 images par seconde).
export const Root: React.FC = () => (
  <>
    <Composition id="Onde" component={Onde} width={1080} height={1920} fps={30} durationInFrames={20 * 30} />
    <Composition id="Sniper" component={Sniper} width={1080} height={1920} fps={30} durationInFrames={15 * 30} />
    <Composition id="CheatCodeLogo" component={CheatCodeLogo} width={1080} height={1920} fps={30} durationInFrames={15 * 30} />
    <Composition id="CheatCode" component={CheatCode} width={1080} height={1920} fps={30} durationInFrames={15 * 30} />
  </>
);
