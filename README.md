# India Capital Quest 🇮🇳

A polished, local browser quiz for Indian states and capitals.

## Requirements
- Node.js 18+ (20+ recommended)
- Any modern browser

## Run locally

Open a terminal in this folder:

```bash
npm install
npm run dev
```

Vite will show a local URL, normally:
http://localhost:5173

Open that address in your browser.

## Production build

```bash
npm run build
npm run preview
```

## Features
- Easy / Medium / Challenge modes
- Quest mode (scored, 3-life system) and Practice mode (no lives, no pressure)
- Child-friendly avatar picker, saved in the browser
- Random state selection
- Random capital/state question direction
- Random answer order (with duplicate-answer protection when two states share a capital, e.g. Chandigarh)
- 28 Indian states
- Score, percentage and timer
- Streak tracking
- Hints
- Correct/wrong sound effects (Web Audio, no audio files)
- "Learn this state" card with a fun fact after a wrong answer
- Confetti celebration for high scores
- Immediate feedback
- End-of-quiz review
- Trophy tiers
- Best streak saved in the browser
- Responsive design for laptop, tablet and phone
- No backend or database required

## Notes

The app intentionally uses only React/Vite and local data, so it can run completely locally after dependencies are installed.
