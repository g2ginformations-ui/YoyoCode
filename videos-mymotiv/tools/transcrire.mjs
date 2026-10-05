// Transcription mot à mot (Whisper « small » hors ligne : npm i --ignore-scripts sts-whisper-small @huggingface/transformers).
import { pipeline, env } from "@huggingface/transformers";
import fs from "node:fs";
env.allowRemoteModels = false;
env.localModelPath = "./node_modules/sts-whisper-small/models/";
// lecture du WAV 16 kHz mono (PCM 16 bits)
const buf = fs.readFileSync("../voix/voix16k.wav");
const dataStart = buf.indexOf(Buffer.from("data")) + 8;
const pcm = new Int16Array(buf.buffer.slice(buf.byteOffset + dataStart, buf.byteOffset + buf.length - ((buf.length - dataStart) % 2)));
const audio = Float32Array.from(pcm, (v) => v / 32768);
const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-small", { dtype: "q8" });
const out = await asr(audio, { language: "french", task: "transcribe", return_timestamps: "word", chunk_length_s: 30, stride_length_s: 5 });
fs.writeFileSync("../voix/transcription.json", JSON.stringify(out, null, 1));
console.log(out.text);
