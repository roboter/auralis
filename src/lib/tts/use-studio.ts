import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_PROMPT,
  LANGUAGES,
  MAX_PROMPT_CHARS,
  type Language,
  type NeuralVoice,
  mergeLanguagesFromVoices,
  neuralVoicesFor,
  voiceMatchesLanguage,
} from "./catalog";
import { downloadBlob } from "./wav";
import { isNeuralReady, loadNeuralModel, synthesizeNeural } from "./neural";
import { playSamples, type PlayHandle } from "./player";

export type EngineId = "speech-api" | "local-model";
export type StudioStatus = "idle" | "speaking" | "paused" | "loading" | "synthesizing";

export type HistoryItem = {
  id: string;
  text: string;
  language: string;
  engine: EngineId;
  voiceName: string;
  at: number;
};

export type DeviceVoice = {
  uri: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
};

const SETTINGS_KEY = "auralis-settings-v1";

type Persisted = {
  prompt: string;
  language: string;
  engine: EngineId;
  rate: number;
  pitch: number;
  volume: number;
  neuralVoiceId: string;
  deviceVoiceURI: string | null;
  history: HistoryItem[];
};

function readSettings(): Partial<Persisted> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : {};
  } catch {
    return {};
  }
}

function mapDeviceVoices(list: SpeechSynthesisVoice[]): DeviceVoice[] {
  return list.map((v) => ({
    uri: v.voiceURI,
    name: v.name,
    lang: v.lang,
    localService: v.localService,
    default: v.default,
  }));
}

export function useStudio() {
  const saved = useRef<Partial<Persisted>>({});
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [language, setLanguage] = useState("en-US");
  const [engine, setEngine] = useState<EngineId>("speech-api");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [neuralVoiceId, setNeuralVoiceId] = useState("af_heart");
  const [deviceVoiceURI, setDeviceVoiceURI] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [deviceVoices, setDeviceVoices] = useState<DeviceVoice[]>([]);
  const [status, setStatus] = useState<StudioStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [neuralReady, setNeuralReady] = useState(isNeuralReady());
  const [neuralPercent, setNeuralPercent] = useState(0);
  const [neuralFile, setNeuralFile] = useState("model");
  const [lastWav, setLastWav] = useState<Blob | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [energy, setEnergy] = useState(0);

  const playRef = useRef<PlayHandle | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const languages = useMemo(() => {
    return mergeLanguagesFromVoices(deviceVoices.map((v) => v.lang));
  }, [deviceVoices]);

  const currentLanguage: Language =
    languages.find((l) => l.code === language) ?? LANGUAGES[0]!;

  const speechVoices = useMemo(
    () => deviceVoices.filter((v) => voiceMatchesLanguage(v.lang, language)),
    [deviceVoices, language],
  );

  const neuralVoices = useMemo(() => neuralVoicesFor(language), [language]);

  const activeDeviceVoice = useMemo(() => {
    return (
      speechVoices.find((v) => v.uri === deviceVoiceURI) ??
      speechVoices.find((v) => v.default) ??
      speechVoices[0] ??
      null
    );
  }, [speechVoices, deviceVoiceURI]);

  const activeNeuralVoice: NeuralVoice | null =
    neuralVoices.find((v) => v.id === neuralVoiceId) ?? neuralVoices[0] ?? null;

  const voiceName =
    engine === "local-model"
      ? (activeNeuralVoice?.name ?? "Heart")
      : (activeDeviceVoice?.name ?? "Default");

  useEffect(() => {
    const stored = readSettings();
    saved.current = stored;
    if (stored.prompt) setPrompt(stored.prompt);
    if (stored.language) setLanguage(stored.language);
    if (stored.engine) setEngine(stored.engine);
    if (typeof stored.rate === "number") setRate(stored.rate);
    if (typeof stored.pitch === "number") setPitch(stored.pitch);
    if (typeof stored.volume === "number") setVolume(stored.volume);
    if (stored.neuralVoiceId) setNeuralVoiceId(stored.neuralVoiceId);
    if (stored.deviceVoiceURI) setDeviceVoiceURI(stored.deviceVoiceURI);
    if (stored.history) setHistory(stored.history);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const sync = () => setDeviceVoices(mapDeviceVoices(window.speechSynthesis.getVoices()));
    sync();
    window.speechSynthesis.addEventListener("voiceschanged", sync);
    const t = window.setTimeout(sync, 250);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", sync);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: Persisted = {
      prompt,
      language,
      engine,
      rate,
      pitch,
      volume,
      neuralVoiceId,
      deviceVoiceURI,
      history,
    };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    } catch {
      /* quota */
    }
  }, [hydrated, prompt, language, engine, rate, pitch, volume, neuralVoiceId, deviceVoiceURI, history]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    playRef.current?.stop();
    playRef.current = null;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setAnalyser(null);
    setStatus("idle");
    setProgress(0);
    setEnergy(0);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const applyLanguage = useCallback(
    (code: string, { fillSample = false }: { fillSample?: boolean } = {}) => {
      const next = languages.find((l) => l.code === code) ?? languageByFallback(code);
      setLanguage(next.code);
      const sampleSet = new Set(LANGUAGES.map((l) => l.sample));
      if (fillSample || !prompt.trim() || sampleSet.has(prompt.trim())) {
        setPrompt(next.sample);
      }
      const nVoices = neuralVoicesFor(next.code);
      if (nVoices.length && !nVoices.some((v) => v.id === neuralVoiceId)) {
        setNeuralVoiceId(nVoices[0]!.id);
      }
      if (engine === "local-model" && nVoices.length === 0) {
        setEngine("speech-api");
      }
    },
    [engine, languages, neuralVoiceId, prompt],
  );

  const ensureNeural = useCallback(async () => {
    if (isNeuralReady()) {
      setNeuralReady(true);
      setNeuralPercent(100);
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      await loadNeuralModel((p) => {
        setNeuralFile(p.file.split("/").pop() ?? p.file);
        setNeuralPercent(p.percent);
      });
      setNeuralReady(true);
      setNeuralPercent(100);
      setStatus("idle");
    } catch (err) {
      setNeuralReady(false);
      setStatus("idle");
      const message = err instanceof Error ? err.message : "Could not load the local model.";
      setError(message);
      throw err;
    }
  }, []);

  const switchEngine = useCallback(
    async (next: EngineId) => {
      stop();
      if (next === "local-model") {
        if (!currentLanguage.neural) {
          applyLanguage("en-US", { fillSample: true });
        }
        setEngine(next);
        try {
          await ensureNeural();
        } catch {
          setEngine("speech-api");
        }
        return;
      }
      setEngine(next);
    },
    [applyLanguage, currentLanguage.neural, ensureNeural, stop],
  );

  const speakWithSpeechApi = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("This browser does not expose the Speech Synthesis API.");
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      setError(
        "This browser has not published on-device voices yet. Load the local model for English, or try Chrome, Safari, or Edge.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(prompt.trim());
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = volume;
    utter.lang = language;
    const match = voices.find((v) => v.voiceURI === activeDeviceVoice?.uri);
    if (match) utter.voice = match;

    utter.onstart = () => {
      setStatus("speaking");
      setProgress(0);
    };
    utter.onboundary = (ev) => {
      if (prompt.length > 0 && typeof ev.charIndex === "number") {
        setProgress(Math.min(1, ev.charIndex / prompt.length));
        setEnergy(0.35 + Math.random() * 0.5);
      }
    };
    utter.onpause = () => setStatus("paused");
    utter.onresume = () => setStatus("speaking");
    utter.onerror = (ev) => {
      if (ev.error === "canceled" || ev.error === "interrupted") {
        setStatus("idle");
        setEnergy(0);
        return;
      }
      if (ev.error === "synthesis-failed" || ev.error === "synthesis-unavailable") {
        setError(
          "The Speech API could not speak this language here. Try another voice, or the local English model.",
        );
      } else {
        setError(`Speech API: ${ev.error}`);
      }
      setStatus("idle");
      setEnergy(0);
    };
    utter.onend = () => {
      setStatus("idle");
      setProgress(1);
      setEnergy(0);
    };
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [activeDeviceVoice?.uri, language, pitch, prompt, rate, volume]);

  const speakWithNeural = useCallback(async () => {
    await ensureNeural();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("synthesizing");
    setLastWav(null);
    try {
      const result = await synthesizeNeural({
        text: prompt.trim(),
        voice: activeNeuralVoice?.id ?? "af_heart",
        speed: rate,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setLastWav(result.blob);
      setStatus("speaking");
      const handle = await playSamples({
        samples: result.samples,
        sampleRate: result.sampleRate,
        volume,
        onProgress: setProgress,
        onEnded: () => {
          setStatus("idle");
          setEnergy(0);
          setAnalyser(null);
        },
      });
      playRef.current = handle;
      setAnalyser(handle.getAnalyser());
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Neural synthesis failed.");
    }
  }, [activeNeuralVoice?.id, ensureNeural, prompt, rate, volume]);

  const speak = useCallback(async () => {
    const text = prompt.trim();
    if (!text) {
      setError("Write something to speak.");
      return;
    }
    setError(null);
    stop();
    setHistory((prev) => {
      const item: HistoryItem = {
        id: `${Date.now()}`,
        text,
        language,
        engine,
        voiceName,
        at: Date.now(),
      };
      return [item, ...prev.filter((h) => h.text !== text)].slice(0, 16);
    });
    if (engine === "local-model") await speakWithNeural();
    else speakWithSpeechApi();
  }, [engine, language, prompt, speakWithNeural, speakWithSpeechApi, stop, voiceName]);

  const pause = useCallback(() => {
    if (engine === "speech-api" && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setStatus("paused");
      return;
    }
    playRef.current?.pause();
    setStatus("paused");
  }, [engine]);

  const resume = useCallback(() => {
    if (engine === "speech-api") {
      window.speechSynthesis.resume();
      setStatus("speaking");
      return;
    }
    playRef.current?.resume();
    setStatus("speaking");
  }, [engine]);

  const downloadLast = useCallback(() => {
    if (!lastWav) return;
    const slug = prompt.trim().slice(0, 24).replace(/\s+/g, "-").toLowerCase() || "auralis";
    downloadBlob(lastWav, `${slug}.wav`);
  }, [lastWav, prompt]);

  return {
    prompt,
    setPrompt: (value: string) => setPrompt(value.slice(0, MAX_PROMPT_CHARS)),
    language,
    applyLanguage,
    languages,
    engine,
    switchEngine,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    speechVoices,
    neuralVoices,
    activeDeviceVoice,
    activeNeuralVoice,
    setDeviceVoiceURI,
    setNeuralVoiceId,
    deviceVoices,
    status,
    progress,
    energy,
    error,
    setError,
    neuralReady,
    neuralPercent,
    neuralFile,
    lastWav,
    analyser,
    history,
    voiceName,
    currentLanguage,
    speak,
    pause,
    resume,
    stop,
    downloadLast,
  };
}

function languageByFallback(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]!;
}
