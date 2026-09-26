import { concatAudio, encodeWav, extractSamples } from "./wav";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const KOKORO_URL = "/kokoro.web.js";

type KokoroAudio = {
  audio?: Float32Array;
  data?: Float32Array;
  sampling_rate?: number;
};

type KokoroTTS = {
  generate: (text: string, options?: { voice?: string; speed?: number }) => Promise<KokoroAudio>;
  stream: (
    text: string,
    options?: { voice?: string; speed?: number; split_pattern?: RegExp | null },
  ) => AsyncGenerator<{ text: string; phonemes: string; audio: KokoroAudio }>;
};

type KokoroModule = {
  KokoroTTS: {
    from_pretrained: (
      model_id: string,
      options?: {
        dtype?: "fp32" | "fp16" | "q8" | "q4" | "q4f16";
        device?: "wasm" | "webgpu" | "cpu" | null;
        progress_callback?: (info: {
          status: string;
          name?: string;
          file?: string;
          progress?: number;
          loaded?: number;
          total?: number;
        }) => void;
      },
    ) => Promise<KokoroTTS>;
  };
};

export type NeuralProgress = {
  file: string;
  percent: number;
  status: string;
};

let modelPromise: Promise<KokoroTTS> | null = null;
let ready = false;

export function isNeuralReady() {
  return ready;
}

async function importKokoro(): Promise<KokoroModule> {
  if (typeof window === "undefined") {
    throw new Error("The local model runs in the browser.");
  }
  const href = new URL(KOKORO_URL, window.location.origin).href;
  return import(/* @vite-ignore */ href) as Promise<KokoroModule>;
}

export function loadNeuralModel(
  onProgress?: (progress: NeuralProgress) => void,
): Promise<KokoroTTS> {
  if (modelPromise) return modelPromise;

  modelPromise = (async () => {
    const { KokoroTTS } = await importKokoro();
    const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (info) => {
        const percent =
          typeof info.progress === "number"
            ? info.progress
            : info.total
              ? Math.round(((info.loaded ?? 0) / info.total) * 100)
              : 0;
        onProgress?.({
          file: info.file ?? info.name ?? "model",
          percent: Math.max(0, Math.min(100, percent)),
          status: info.status,
        });
      },
    });
    ready = true;
    return tts;
  })();

  modelPromise.catch(() => {
    modelPromise = null;
    ready = false;
  });

  return modelPromise;
}

function audioFrom(chunk: KokoroAudio): { samples: Float32Array; sampleRate: number } {
  return {
    samples: extractSamples(chunk),
    sampleRate: chunk.sampling_rate ?? 24000,
  };
}

export async function synthesizeNeural(options: {
  text: string;
  voice: string;
  speed: number;
  signal?: AbortSignal;
  onChunk?: (samples: Float32Array, sampleRate: number) => void;
}): Promise<{ samples: Float32Array; sampleRate: number; blob: Blob }> {
  const tts = await loadNeuralModel();
  const chunks: Float32Array[] = [];
  let sampleRate = 24000;

  for await (const part of tts.stream(options.text, {
    voice: options.voice,
    speed: options.speed,
  })) {
    if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const { samples, sampleRate: rate } = audioFrom(part.audio);
    sampleRate = rate;
    chunks.push(samples);
    options.onChunk?.(samples, rate);
  }

  const samples = concatAudio(chunks, Math.round(sampleRate * 0.18));
  return { samples, sampleRate, blob: encodeWav(samples, sampleRate) };
}
