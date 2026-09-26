export type PlayHandle = {
  stop: () => void;
  pause: () => void;
  resume: () => void;
  getAnalyser: () => AnalyserNode | null;
};

let sharedCtx: AudioContext | null = null;

function ctx() {
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

export async function playSamples(options: {
  samples: Float32Array;
  sampleRate: number;
  volume: number;
  onEnded?: () => void;
  onProgress?: (ratio: number) => void;
}): Promise<PlayHandle> {
  const audio = ctx();
  if (audio.state === "suspended") await audio.resume();

  const buffer = audio.createBuffer(1, options.samples.length, options.sampleRate);
  buffer.copyToChannel(new Float32Array(options.samples), 0);

  const source = audio.createBufferSource();
  source.buffer = buffer;

  const gain = audio.createGain();
  gain.gain.value = options.volume;

  const analyser = audio.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.72;

  source.connect(gain);
  gain.connect(analyser);
  analyser.connect(audio.destination);

  const startedAt = audio.currentTime;
  const duration = buffer.duration;
  let pausedAt: number | null = null;
  let offset = 0;
  let raf = 0;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    if (pausedAt == null) {
      const elapsed = audio.currentTime - startedAt + offset;
      options.onProgress?.(Math.min(1, elapsed / duration));
    }
    raf = requestAnimationFrame(tick);
  };

  source.onended = () => {
    if (stopped) return;
    cancelAnimationFrame(raf);
    options.onProgress?.(1);
    options.onEnded?.();
  };

  source.start();
  raf = requestAnimationFrame(tick);

  return {
    getAnalyser: () => analyser,
    stop: () => {
      stopped = true;
      cancelAnimationFrame(raf);
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    },
    pause: () => {
      if (pausedAt != null) return;
      pausedAt = audio.currentTime;
      audio.suspend();
    },
    resume: () => {
      if (pausedAt == null) return;
      offset -= audio.currentTime - pausedAt;
      pausedAt = null;
      audio.resume();
    },
  };
}

export async function playBlob(blob: Blob, volume: number, onEnded?: () => void): Promise<PlayHandle> {
  const buffer = await blob.arrayBuffer();
  const audio = ctx();
  if (audio.state === "suspended") await audio.resume();
  const decoded = await audio.decodeAudioData(buffer.slice(0));
  const channel = decoded.getChannelData(0);
  return playSamples({
    samples: channel,
    sampleRate: decoded.sampleRate,
    volume,
    onEnded,
  });
}
