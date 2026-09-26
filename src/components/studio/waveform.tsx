import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { StudioStatus } from "@/lib/tts/use-studio";

const BAR_COUNT = 42;

export function Waveform({
  status,
  analyser,
  energy,
  progress,
}: {
  status: StudioStatus;
  analyser: AnalyserNode | null;
  energy: number;
  progress: number;
}) {
  const barsRef = useRef<HTMLDivElement>(null);
  const live = status === "speaking" || status === "synthesizing" || status === "paused";

  useEffect(() => {
    const root = barsRef.current;
    if (!root) return;
    const bars = [...root.querySelectorAll<HTMLElement>("[data-bar]")];
    let raf = 0;
    const data = new Uint8Array(analyser?.frequencyBinCount ?? 64);

    const tick = () => {
      if (analyser && status === "speaking") {
        analyser.getByteFrequencyData(data);
      }
      bars.forEach((bar, i) => {
        const mirrored = i < BAR_COUNT / 2 ? i : BAR_COUNT - 1 - i;
        let h: number;
        if (status === "speaking" && analyser) {
          const idx = Math.min(data.length - 1, Math.floor((mirrored / (BAR_COUNT / 2)) * 18) + 2);
          h = 8 + (data[idx] ?? 0) * 0.34;
        } else if (status === "speaking") {
          const pulse = Math.sin(Date.now() / 140 + i * 0.45) * 0.5 + 0.5;
          h = 10 + (0.25 + energy) * 42 * (0.35 + pulse);
        } else if (status === "synthesizing" || status === "loading") {
          const pulse = Math.sin(Date.now() / 220 + i * 0.28) * 0.5 + 0.5;
          h = 8 + pulse * 18;
        } else {
          h = 6 + (i % 7 === 0 ? 6 : 2);
        }
        bar.style.height = `${h}px`;
        bar.style.opacity = live ? "1" : "0.45";
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [analyser, energy, status, live]);

  return (
    <div className="relative flex h-16 w-full items-center gap-px" aria-hidden="true">
      <div ref={barsRef} className="flex h-full w-full items-center justify-between">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <div
            key={i}
            data-bar
            className={cn(
              "wave-bar w-1 origin-center rounded-full transition-[opacity] duration-150",
              live ? "bg-accent" : "bg-muted",
              status === "paused" && "opacity-50",
            )}
            style={{ height: 8 }}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border"
        style={{
          maskImage: `linear-gradient(90deg, var(--color-accent) ${progress * 100}%, transparent ${progress * 100}%)`,
        }}
      />
    </div>
  );
}
