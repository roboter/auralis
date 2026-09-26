# Auralis

[![CI](https://github.com/roboter/auralis/actions/workflows/ci.yml/badge.svg)](https://github.com/roboter/auralis/actions/workflows/ci.yml)

Local text-to-speech studio. No account. No subscription.

Write a prompt, pick a language and voice, then speak. Two engines:

- **Speech API** — on-device voices from the browser’s Speech Synthesis API (every language your OS publishes)
- **Local model** — [Kokoro 82M](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) running in the browser (English, downloadable WAV)

Nothing you type is sent to a paid TTS service.

## Run

```bash
npm install
npm run dev
```

Open the app at the URL Vite prints (default port 8080).

```bash
npm run build
npm run typecheck
```

Pushes and pull requests run typecheck, unit tests, the auth invariant, and a production build via GitHub Actions.

## Use

1. Write what should be spoken, or tap a language chip for a sample.
2. Choose **Speech API** for device voices, or **Local model** for Kokoro.
3. Pick language and voice. Adjust rate, pitch, and level.
4. Press **Speak** (`⌘↵` / `Ctrl+Enter`).
5. After a local-model take, download the WAV.

The first local-model run downloads the ONNX weights once (~90MB) and caches them in the browser.

## Stack

React 19, TanStack Start, Tailwind v4, Vite.
