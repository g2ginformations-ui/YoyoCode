// Configuration du Studio Remotion : Tailwind CSS activé.
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";
Config.overrideWebpackConfig((c) => enableTailwind(c));
