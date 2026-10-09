// Rendu Remotion : node render.mjs [stills t1 t2 …]  → aperçus ; sans argument → vidéo complète.
// FRAMES=1350-1588 OUT=out/morceau.mp4 : ne refaire qu'un passage (images de début et de fin incluses).
import { bundle } from "@remotion/bundler";
import { enableTailwind } from "@remotion/tailwind";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const id = process.env.COMP || "CheatCode";
// Navigateur : celui de Remotion par défaut ; REMOTION_BROWSER permet d'en imposer un autre (ex. Chromium déjà installé).
const browserExecutable = process.env.REMOTION_BROWSER || null;
// GL=angle|swangle|swiftshader : moteur WebGL pour les vidéos en 3D (@remotion/three).
const chromiumOptions = process.env.GL ? { gl: process.env.GL } : {};
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride: (c) => enableTailwind(c) });
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });
const [mode, ...times] = process.argv.slice(2);
if (mode === "stills") {
  fs.mkdirSync("prev", { recursive: true });
  for (const t of times) await renderStill({ serveUrl, composition, browserExecutable, chromiumOptions, scale: Number(process.env.SCALE || 1), frame: Math.round(Number(t) * composition.fps), output: `prev/${id}-${Number(t).toFixed(2)}.png` });
  console.log("aperçus ok");
} else {
  await renderMedia({ serveUrl, composition, browserExecutable, chromiumOptions, scale: Number(process.env.SCALE || 1), codec: "h264", ...(process.env.BITRATE ? { videoBitrate: process.env.BITRATE } : { crf: 16 }), audioBitrate: "192k", pixelFormat: "yuv420p", concurrency: 3, outputLocation: process.env.OUT || `out/${id}.mp4`, ...(process.env.FRAMES ? { frameRange: process.env.FRAMES.split("-").map(Number) } : {}),
    onProgress: ({ progress }) => { if (Math.round(progress * 100) % 20 === 0) process.stdout.write(`${Math.round(progress * 100)}% `); } });
  console.log("\nvidéo ok");
}
