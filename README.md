# 🕷️ ANANSE LEARNING ZONE

An offline-first Progressive Web App for children's adaptive learning, featuring Ananse the Wise Spider and a Ghanaian cultural theme.

**Live site:** [ananseclaw-arch.github.io/ANANSE-LEARNING-ZONE-](https://ananseclaw-arch.github.io/ANANSE-LEARNING-ZONE-/)

---

## Features

### 🧠 Adaptive Learning Engine
- **5 subjects:** Math (NBA/basketball procedural), English, Comprehension, Science, Ghana History
- **5 difficulty levels:** Warmup → On Grade → Conceptual → Multi-Step → Challenge
- **SM-2 spaced repetition** — topics are re-queued on an optimal schedule
- **7,394+ content questions** across the content bank, plus unlimited procedural math

### 👥 Multi-Profile System
- Each child gets a profile with name + 4-digit PIN
- Per-profile progress, stats (speed, reading, memory, strategy, recall), trophies, and learning levels
- "Switch Player" on the home screen

### 🕷️ Ananse Character
- SVG spider character with 3 moods: idle, teach, party
- Animated speech bubbles with Ghanaian wisdom
- "Akwaaba!" welcome (Twi for "welcome")
- Kente cloth color theme throughout

### 🔊 Full Audio
- **Web Audio synthesis** — sound effects generated in real-time (no audio files needed)
- **Speech synthesis (TTS)** — Ananse reads questions and instructions aloud
- Voice selection with quality ranking (better voices score higher)
- Adjustable speech rate

### 📊 Parent Portal (🔒 PIN-gated)
- **Insights dashboard** — plain-English summaries of what happened this week
- **Intervention tracker** — 5-metric evaluation plan updated from sessions
- **Weekly focus goal** — quietly prioritize one topic
- **Spaced repetition view** — see which topics are due
- **Offline activities** — tailored at-home suggestions based on recent struggles
- **3D Web Kingdom toggle** — experimental Three.js hub (parent opt-in)
- **Voice settings** — choose voice and speed
- **Backup/Restore** — export all data as JSON, restore on any device
- **Reset options** — reset one profile's progress or wipe everything

### 📲 Telegram Parent Reports
- Daily progress report with: subjects studied, topics taught, streak, trophies
- Personalized prompts: "One thing to say tonight" + "One thing to do tomorrow"
- Threshold alerts: low accuracy, declining scores, short sessions
- Celebration alerts for milestones and achievements
- Configurable send time

### 🧠 Diagnostic Adventure
- First-launch 15-question assessment ("The Explorer's Trail")
- No scores or pressure — purely diagnostic
- Determines starting level for each subject

### 🏆 Gamification
- **Trophy room** with earned trophies per subject
- **Streak tracking** (current + best)
- **XP points**
- **Player card** with radar stats
- **Daily mystery challenge**
- **Story replay** — read-then-quiz comprehension mode
- **Spot the Pattern** — visual/audio pattern recognition game
- **Hoops!** — basketball reward mini-game

### 🧘 ADHD-Friendly Design
- Brain breaks between rounds (movement exercises)
- Visual progress dots during sessions
- No timers — work at your own pace
- Clear, high-contrast UI
- TTS reads everything aloud

### 🕷️ Ask Ananse — AI Tutor (optional)
- Connects to a local Hermes agent running on a Mac mini
- Private, free, runs on your own hardware
- Chat button appears only when the server is reachable
- Configure in Parent Portal

### 📱 PWA (Progressive Web App)
- **Installable** — add to home screen on iOS/Android/desktop
- **Fully offline** — service worker caches everything
- Works as a standalone app
- Icons at 180px, 192px, and 512px

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS (0 dependencies, single 253KB `index.html`) |
| Styling | Pure CSS, Kente cloth color palette |
| Audio | Web Audio API + Speech Synthesis API |
| 3D Hub | Three.js (loaded on demand) |
| Storage | IndexedDB (via localStorage wrapper) |
| Offline | Service Worker (v21) |
| Reports | Telegram Bot API |
| Hosting | GitHub Pages |

---

## File Structure

```
ANANSE-LEARNING-ZONE-/
├── index.html           # Entire app (HTML + CSS + JS, 3,188 lines)
├── sw.js                # Service worker for offline support
├── manifest.webmanifest # PWA manifest (installable)
├── icon-180.png         # PWA icon (180×180)
├── icon-192.png         # PWA icon (192×192)
├── icon-512.png         # PWA icon (512×512)
└── index.html           # (also serves as 404 fallback for SPA routing)
```

---

## Architecture

The app is organized into **9 inline script blocks** within `index.html`:

1. **Core utilities** — Sound engine, Ananse SVG, TTS, confetti, profiles
2. **Content banks** — Reading, Science, Ghana History question banks
3. **Math engine** — Procedural NBA/basketball math generation + SM-2 algorithm
4. **Session engine** — Screen rendering, question flow, teaching, brain breaks, hoops
5. **Story bank** — Read-then-quiz comprehension stories
6. **Diagnostic** — Placement test, daily challenges, trophy room, stats
7. **Parent dashboard** — PIN-gated parent view, Telegram reports, backup/restore
8. **Ask Ananse** — Optional AI tutor connecting to local Hermes server
9. **Web Kingdom** — 3D Three.js hub with subject dewdrop orbs

---

## Setup

### Deploy

1. Fork or clone this repo
2. Go to **Settings → Pages** in your GitHub repo
3. Set source to `main` branch, root folder
4. Your site is live at `https://<username>.github.io/ANANSE-LEARNING-ZONE-/`

### Telegram Reports (optional)

1. Create a bot with [@BotFather](https://t.me/BotFather) on Telegram
2. Get your chat ID (message [@userinfobot](https://t.me/userinfobot))
3. Open the app, go to **Parent Portal → Daily Telegram Report**
4. Enter bot token and chat ID, set preferred time
5. Click **Send test now** to verify

### Ask Ananse AI Tutor (optional)

1. Set up Hermes agent on a local Mac
2. Expose it via a tunnel (e.g., Cloudflare Tunnel)
3. Paste the URL and key in **Parent Portal → Ask Ananse**

---

## Development

This is a **single-file app** — all HTML, CSS, and JavaScript live in `index.html`. To modify:

1. Edit `index.html` directly
2. Test by opening it in a browser (`open index.html`)
3. Bump the service worker version in `sw.js` if changing cached assets
4. Push to `main` — GitHub Pages deploys automatically

No build step, no package manager, no framework. Just a single file.

---

## Credits

Built for Prince. Akwaaba! 🕷️