# Auralis

<p align="center">
	<img src="public/og.jpg" alt="Auralis: an audio waveform, desk lamp, and spoken manuscript" width="1200" />
</p>

<p align="center">
	<strong>Words into voice, right in your browser.</strong><br />
	A private, local text-to-speech studio. No account. No subscription.
</p>

<p align="center">
	<a href="https://github.com/roboter/auralis/actions/workflows/ci.yml"><img src="https://github.com/roboter/auralis/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
</p>

Write or paste a prompt, choose a language and voice, then speak. Auralis offers two synthesis engines:

| Engine          | What it does                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| **Speech API**  | Uses voices provided by your browser and operating system, across the languages available on your device. |
| **Local model** | Runs Kokoro 82M in your browser for English speech and downloadable WAV audio.                            |

Your text is processed in the browser and is not sent to a paid text-to-speech service.

## Quick start

Requires **Node.js 22.12 or newer**.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (port 8080 by default).

## Use Auralis

1. Enter text, or choose a language chip to fill in a sample.
2. Select **Speech API** or **Local model**.
3. Choose a language and voice, then adjust the rate, pitch, and level.
4. Select **Speak** or press `⌘↵` / `Ctrl+Enter`.
5. With the local model, download the generated WAV after speaking.

The first local-model run downloads about 90 MB of model files. They are cached in your browser for later use.

## Development

```bash
npm run build
npm run typecheck
npm test
```

GitHub Actions runs typecheck, unit tests, and a production build for pushes and pull requests.

## Stack

React 19 · TanStack Start · Tailwind CSS v4 · Vite
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

Pushes and pull requests run typecheck, unit tests, and a production build via GitHub Actions.

## Use

1. Write what should be spoken, or tap a language chip for a sample.
2. Choose **Speech API** for device voices, or **Local model** for Kokoro.
3. Pick language and voice. Adjust rate, pitch, and level.
4. Press **Speak** (`⌘↵` / `Ctrl+Enter`).
5. After a local-model take, download the WAV.

The first local-model run downloads the ONNX weights once (~90MB) and caches them in the browser.

## Stack

React 19, TanStack Start, Tailwind v4, Vite.
