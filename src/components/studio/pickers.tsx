import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Language, NeuralVoice } from "@/lib/tts/catalog";
import type { DeviceVoice } from "@/lib/tts/use-studio";

function FilterField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="mb-2 flex h-11 items-center gap-2 rounded-md bg-surface-2 px-3">
      <Search className="size-4 text-subtle" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full bg-transparent text-sm text-fg placeholder:text-subtle focus-visible:outline-none"
      />
    </label>
  );
}

export function LanguagePicker({
  languages,
  value,
  onChange,
}: {
  languages: Language[];
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = languages.find((l) => l.code === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter((l) =>
      `${l.name} ${l.region} ${l.nativeName} ${l.code}`.toLowerCase().includes(q),
    );
  }, [languages, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="h-11 w-full justify-between rounded-lg px-3">
          <span className="flex min-w-0 flex-col items-start">
            <span className="text-xs text-muted">Language</span>
            <span className="truncate text-sm text-fg">
              {current ? `${current.name} · ${current.region}` : value}
            </span>
          </span>
          <ChevronDown className="size-4 text-muted" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
        <FilterField value={query} onChange={setQuery} placeholder="Search languages" />
        <ScrollArea className="h-64">
          <ul className="flex flex-col gap-0.5">
            {filtered.map((lang) => {
              const active = lang.code === value;
              return (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(lang.code);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm",
                      active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-fg">
                        {lang.name}
                        <span className="text-subtle"> · {lang.region}</span>
                      </span>
                      <span className="truncate text-xs text-subtle">{lang.nativeName}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {lang.neural ? (
                        <span className="text-[10px] tracking-wide text-accent uppercase">Model</span>
                      ) : null}
                      {active ? <Check className="size-4 text-accent" /> : null}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">No languages match.</li>
            ) : null}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function VoicePicker({
  engine,
  speechVoices,
  neuralVoices,
  deviceURI,
  neuralId,
  onDevice,
  onNeural,
}: {
  engine: "speech-api" | "local-model";
  speechVoices: DeviceVoice[];
  neuralVoices: NeuralVoice[];
  deviceURI: string | null;
  neuralId: string;
  onDevice: (uri: string) => void;
  onNeural: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isNeural = engine === "local-model";
  const currentLabel = isNeural
    ? (neuralVoices.find((v) => v.id === neuralId)?.name ?? "Heart")
    : (speechVoices.find((v) => v.uri === deviceURI)?.name ??
      speechVoices[0]?.name ??
      "No voice yet");

  const filteredNeural = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return neuralVoices;
    return neuralVoices.filter((v) => `${v.name} ${v.gender} ${v.lang}`.toLowerCase().includes(q));
  }, [neuralVoices, query]);

  const filteredSpeech = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return speechVoices;
    return speechVoices.filter((v) => `${v.name} ${v.lang}`.toLowerCase().includes(q));
  }, [speechVoices, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="h-11 w-full justify-between rounded-lg px-3">
          <span className="flex min-w-0 flex-col items-start">
            <span className="text-xs text-muted">Voice</span>
            <span className="truncate text-sm text-fg">{currentLabel}</span>
          </span>
          <ChevronDown className="size-4 text-muted" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
        <FilterField value={query} onChange={setQuery} placeholder="Search voices" />
        <ScrollArea className="h-64">
          {isNeural ? (
            <ul className="flex flex-col gap-0.5">
              {filteredNeural.map((voice) => {
                const active = voice.id === neuralId;
                return (
                  <li key={voice.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onNeural(voice.id);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm",
                        active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                      )}
                    >
                      <span>
                        <span className="block text-fg">{voice.name}</span>
                        <span className="text-xs text-subtle">
                          {voice.gender} · {voice.lang}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-subtle tabular-nums">
                          {voice.grade}
                        </span>
                        {active ? <Check className="size-4 text-accent" /> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : filteredSpeech.length ? (
            <ul className="flex flex-col gap-0.5">
              {filteredSpeech.map((voice) => {
                const active = voice.uri === deviceURI || (!deviceURI && voice === speechVoices[0]);
                return (
                  <li key={voice.uri}>
                    <button
                      type="button"
                      onClick={() => {
                        onDevice(voice.uri);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm",
                        active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-fg">{voice.name}</span>
                        <span className="text-xs text-subtle">
                          {voice.lang}
                          {voice.localService ? " · on-device" : ""}
                        </span>
                      </span>
                      {active ? <Check className="size-4 text-accent" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted">
              No Speech API voices for this language on this device. Try another language, or load
              the local model for English.
            </p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
