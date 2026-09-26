export function extractSamples(audio: {
  audio?: Float32Array;
  data?: Float32Array;
}): Float32Array {
  const src = audio.audio ?? audio.data;
  if (src instanceof Float32Array) return src;
  if (ArrayBuffer.isView(src)) return new Float32Array(src as ArrayLike<number>);
  throw new Error("Neural engine returned empty audio.");
}

export function concatAudio(chunks: Float32Array[], gapSamples = 0): Float32Array {
  const total = chunks.reduce((sum, c) => sum + c.length, 0) + gapSamples * Math.max(0, chunks.length - 1);
  const out = new Float32Array(total);
  let offset = 0;
  chunks.forEach((chunk, i) => {
    out.set(chunk, offset);
    offset += chunk.length;
    if (i < chunks.length - 1 && gapSamples > 0) offset += gapSamples;
  });
  return out;
}

export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let cursor = 44;
  for (let i = 0; i < samples.length; i++, cursor += 2) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(cursor, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
