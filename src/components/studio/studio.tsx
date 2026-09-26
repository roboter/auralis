import { useEffect, type ReactNode } from "react";
import {
  Clock3,
  Download,
  LoaderCircle,
  Mic,
  Pause,
  Play,
  Square,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MAX_PROMPT_CHARS } from "@/lib/tts/catalog";
import { useStudio, type EngineId } from "@/lib/tts/use-studio";
import { cn } from "@/lib/utils";
import { LanguagePicker, VoicePicker } from "./pickers";
import { Waveform } from "./waveform";

const ENGINES: { id: EngineId; label: string; hint: string }[] = [
  { id: "speech-api", label: "Speech API", hint: "On-device voices from this browser" },
  { id: "local-model", label: "Local model", hint: "Kokoro 82M, English, runs here" },
];

export function Studio() {
  const s = useStudio();

  useEffect(() => {
    if (s.error) toast.error(s.error, { id: "studio-error" });
  }, [s.error]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (s.status === "speaking") s.stop();
        else void s.speak();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s.status, s.speak, s.stop]);

  const busy = s.status === "loading" || s.status === "synthesizing";
  const speaking = s.status === "speaking";
  const paused = s.status === "paused";
  const canDownload = Boolean(s.lastWav) && s.engine === "local-model";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative min-h-dvh bg-bg text-fg">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-80"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--color-accent) 7%, transparent), transparent)",
          }}
        />

        <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-5 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:px-8 md:pt-8 md:pb-28">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs tracking-[0.18em] text-muted uppercase">
                <Lamp live={speaking} />
                {speaking ? "On air" : paused ? "Held" : busy ? "Warming" : "Standby"}
              </p>
              <h1 className="font-display text-4xl leading-none font-medium tracking-tight md:text-5xl">
                Auralis
              </h1>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Text to speech in this browser. No account. No subscription. Speech API for every
                language your device knows, plus a local English model.
              </p>
            </div>
            <HistorySheet
              items={s.history}
              onPick={(text, lang) => {
                s.setPrompt(text);
                s.applyLanguage(lang);
              }}
            />
          </header>

          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.9fr)]">
            <section className="rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)] md:p-4">
              <div className="rounded-xl bg-bg px-4 py-4 md:px-5 md:py-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Label htmlFor="prompt" className="uppercase">
                    Prompt
                  </Label>
                  <span className="font-mono text-xs text-subtle tabular-nums">
                    {s.prompt.length}/{MAX_PROMPT_CHARS}
                  </span>
                </div>
                <Textarea
                  id="prompt"
                  value={s.prompt}
                  onChange={(e) => s.setPrompt(e.target.value)}
                  placeholder="Write what should be spoken…"
                  className="font-display min-h-48 text-lg leading-snug text-fg md:min-h-64 md:text-2xl"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 px-1">
                {s.languages
                  .filter((l) => l.neural || ["es-ES", "fr-FR", "de-DE", "ja-JP", "zh-CN"].includes(l.code))
                  .slice(0, 6)
                  .map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => s.applyLanguage(lang.code, { fillSample: true })}
                      className={cn(
                        "h-9 rounded-full px-3 text-xs tracking-wide",
                        s.language === lang.code
                          ? "bg-fg text-bg"
                          : "bg-surface-2 text-muted hover:text-fg",
                      )}
                    >
                      {lang.code.startsWith("en-")
                        ? `English ${lang.code.slice(3)}`
                        : lang.nativeName}
                    </button>
                  ))}
              </div>
            </section>

            <aside className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] md:p-5">
              <p className="mb-3 text-xs font-medium tracking-wide text-muted uppercase">Mixer</p>
              <EngineSwitch
                value={s.engine}
                loading={s.status === "loading"}
                percent={s.neuralPercent}
                onChange={(id) => void s.switchEngine(id)}
              />
              <p className="mt-2 mb-4 text-xs text-subtle">
                {s.engine === "speech-api"
                  ? s.speechVoices.length
                    ? `${s.speechVoices.length} Speech API voices for this language.`
                    : s.deviceVoices.length
                      ? "This language has no voice on this device yet."
                      : "Waiting for the Speech Synthesis API to publish voices."
                  : s.neuralReady
                    ? "Kokoro 82M is cached in this browser. English only. Audio can be saved."
                    : `Loads once (~90MB). ${s.neuralFile} ${Math.round(s.neuralPercent)}%`}
              </p>

              <div className="flex flex-col gap-3">
                <LanguagePicker
                  languages={s.languages}
                  value={s.language}
                  onChange={(code) => s.applyLanguage(code, { fillSample: true })}
                />
                <VoicePicker
                  engine={s.engine}
                  speechVoices={s.speechVoices}
                  neuralVoices={s.neuralVoices}
                  deviceURI={s.activeDeviceVoice?.uri ?? null}
                  neuralId={s.activeNeuralVoice?.id ?? "af_heart"}
                  onDevice={s.setDeviceVoiceURI}
                  onNeural={s.setNeuralVoiceId}
                />
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
                <Control
                  label="Rate"
                  value={`${s.rate.toFixed(2)}×`}
                  min={0.5}
                  max={1.6}
                  step={0.05}
                  sliderValue={s.rate}
                  onChange={s.setRate}
                />
                <Control
                  label="Pitch"
                  value={s.pitch.toFixed(2)}
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  sliderValue={s.pitch}
                  onChange={s.setPitch}
                  disabled={s.engine === "local-model"}
                  hint={s.engine === "local-model" ? "Speech API" : undefined}
                />
                <Control
                  label="Level"
                  value={`${Math.round(s.volume * 100)}%`}
                  min={0.1}
                  max={1}
                  step={0.05}
                  sliderValue={s.volume}
                  onChange={s.setVolume}
                  icon={<Volume2 className="size-3.5" />}
                />
              </div>
            </aside>
          </div>
        </div>

        <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:gap-5 md:px-8">
            <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
              <div className="w-44 shrink-0">
                <p className="truncate text-sm text-fg">{s.voiceName}</p>
                <p className="truncate text-xs text-subtle">{statusLabel(s.status)}</p>
              </div>
              <Waveform
                status={s.status}
                analyser={s.analyser}
                energy={s.energy}
                progress={s.progress}
              />
            </div>
            <div className="min-w-0 flex-1 md:hidden">
              <p className="truncate text-sm text-muted">{s.voiceName}</p>
              <p className="truncate text-xs text-subtle">{statusLabel(s.status)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={s.stop}
                    disabled={s.status === "idle"}
                    aria-label="Stop"
                  >
                    <Square className="size-4 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Stop</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={s.downloadLast}
                    disabled={!canDownload}
                    aria-label="Download wav"
                  >
                    <Download className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {canDownload ? "Download last take" : "Save is available after the local model speaks"}
                </TooltipContent>
              </Tooltip>
              <Button
                size="lg"
                className="min-w-28 rounded-lg pl-5 pr-4"
                onClick={() => {
                  if (speaking) s.pause();
                  else if (paused) s.resume();
                  else void s.speak();
                }}
                disabled={busy}
              >
                {busy ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : speaking ? (
                  <Pause className="size-4 fill-current" />
                ) : (
                  <Play className="ml-0.5 size-4 fill-current" />
                )}
                {busy ? "Working" : speaking ? "Pause" : paused ? "Resume" : "Speak"}
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

function Lamp({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        "inline-block size-1.5 rounded-full bg-subtle",
        live && "lamp-live bg-accent",
      )}
    />
  );
}

function EngineSwitch({
  value,
  onChange,
  loading,
  percent,
}: {
  value: EngineId;
  onChange: (id: EngineId) => void;
  loading: boolean;
  percent: number;
}) {
  return (
    <div className="relative grid grid-cols-2 rounded-lg bg-surface-2 p-1">
      {ENGINES.map((engine) => {
        const active = engine.id === value;
        return (
          <button
            key={engine.id}
            type="button"
            onClick={() => onChange(engine.id)}
            className={cn(
              "relative z-10 h-11 rounded-md text-sm font-medium transition-colors duration-150",
              active ? "bg-bg text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
            )}
          >
            {engine.id === "local-model" && loading ? (
              <span className="shimmer-text">{Math.round(percent)}%</span>
            ) : (
              engine.label
            )}
          </button>
        );
      })}
    </div>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  sliderValue,
  onChange,
  disabled,
  hint,
  icon,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  sliderValue: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={cn("mb-1", disabled && "opacity-40")}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5">
          {icon}
          {label}
        </Label>
        <span className="font-mono text-xs text-subtle tabular-nums">{value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[sliderValue]}
        disabled={disabled}
        onValueChange={(v) => onChange(v[0] ?? sliderValue)}
      />
      {hint ? <p className="text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

function HistorySheet({
  items,
  onPick,
}: {
  items: { id: string; text: string; language: string; voiceName: string; at: number; engine: EngineId }[];
  onPick: (text: string, language: string) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0" aria-label="History">
          <Clock3 className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Takes</SheetTitle>
          <SheetDescription>Recent prompts stay on this device.</SheetDescription>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <Mic className="size-6 text-subtle" />
            <p className="text-sm text-muted">Nothing spoken yet. Write a prompt and press Speak.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onPick(item.text, item.language)}
                    className="w-full rounded-lg bg-surface-2 p-3 text-left hover:bg-bg-elevated"
                  >
                    <p className="line-clamp-3 text-sm text-fg">{item.text}</p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-subtle">
                      <Badge variant="outline">{item.voiceName}</Badge>
                      <span>{item.language}</span>
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

function statusLabel(status: string) {
  if (status === "speaking") return "Speaking";
  if (status === "paused") return "Paused";
  if (status === "loading") return "Loading local model";
  if (status === "synthesizing") return "Rendering speech";
  return "Ready";
}
