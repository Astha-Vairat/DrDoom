# ☠️ Dr.Doom — Attention Reclamation System

> *"We're turning attention into a shared, visible resource — so AI stops stealing it and starts working for you."*

## 🏆 Hackathon Track
**Attention** — NYU Hackathon 2026

---

## 🧠 What is Dr.Doom?

Dr.Doom is an AI-native, socially-driven attention management platform that fights back against doomscrolling. Modern social media platforms deploy AI systems that optimize for engagement over user well-being — creating endless scroll loops, eroding time awareness, and exploiting attention as a commodity.

Dr.Doom flips that dynamic. By making doomscrolling **visible, measurable, and socially accountable**, it transforms attention into a shared resource that users can optimize for themselves — not for advertisers.

---

## ✨ Features

### Core
- **Doom Score** — Real-time attention health score (0–100) based on scroll behavior
- **Weekly Verdict** — Blunt, honest summary of your week: *"You scrolled more than you slept."*
- **Attention Timeline** — Visual playback of your day showing on-track vs. off-track segments
- **Goals Tracking** — Set weekly intentions and track adherence across all your goals
- **Stats Dashboard** — Total scroll distance (km), time lost, sessions, intent drift events

### AI-Powered (Claude)
- **AI Check-In Chat** — Weekly conversational review with DrDoom AI, a sharp friend who holds you accountable
- **Personalised Conversions** — AI transforms your wasted hours into emotionally resonant life-cost equivalents specific to *your* goals
- **AI Ping Messages** — Send AI-generated nudges to friends who are doomscrolling

### Social
- **Orbit** — Live accountability network showing your friends' real-time scroll status
- **AI Pings** — One-tap to send a Claude-generated nudge to a drifting friend
- **Weekly Standings** — Leaderboard ranked by doom score
- **Community Challenges** — Join group challenges (No-scroll mornings, Sub-30 club, Deep work streak)
- **Anonymous Leaderboard** — Compete without exposing your identity

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Next.js 14 (API routes) |
| Database | SQLite via Prisma ORM |
| AI | Anthropic Claude Sonnet (claude-sonnet-4-20250514) |
| Fonts | Bebas Neue, DM Mono, DM Sans (Google Fonts) |

---

## 🚀 How to Run

### Prerequisites
- Node.js v20+
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### 1. Clone the repo
```bash
git clone https://github.com/Astha-Vairat/DrDoom.git
cd DrDoom
```

### 2. Start the frontend
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:
```
VITE_ANTHROPIC_API_KEY=your-anthropic-key-here
```

Then run:
```bash
npm run dev
```

Frontend runs at **http://localhost:5173**

### 3. Start the backend (optional — for data persistence)
```bash
cd ../backend
npm install
```

Create a `.env` file in the `backend/` folder:
```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=your-anthropic-key-here
```

Then run:
```bash
npx prisma migrate dev --name init
npm run dev
```

Backend runs at **http://localhost:3000**

> **Note:** The frontend works fully standalone without the backend. All AI features (check-in chat, personalised conversions, ping messages) run directly via the Anthropic API. The backend adds session persistence and drift event logging.

---

## 📱 App Flow

1. **Onboarding** — Land on the Dr.Doom splash screen
2. **Set Goals** — Pick or type your weekly intentions
3. **YOU screen** — See your doom score, weekly verdict, stats, timeline, and AI-personalised life-cost conversions
4. **Check-In** — Have a weekly AI conversation with DrDoom about what was worth it
5. **Orbit** — See your friends' live scroll status; ping drifting friends with AI-generated messages
6. **Community** — Join challenges, climb the leaderboard, read community wins

---

## 🤖 AI Attribution & Third-Party Tools

This project uses the following open-source libraries and AI services:

| Tool | Usage |
|------|-------|
| [Anthropic Claude](https://anthropic.com) | AI check-in chat, personalised conversions, ping message generation |
| [React](https://react.dev) | Frontend UI framework |
| [Vite](https://vite.dev) | Frontend build tool |
| [Next.js](https://nextjs.org) | Backend API routes |
| [Prisma](https://prisma.io) | Database ORM |
| [Google Fonts](https://fonts.google.com) | Bebas Neue, DM Mono, DM Sans typography |

All product design, application logic, UI, and AI prompt engineering is original work created during the hackathon.

---

## 👥 Team

- **Astha Vairat** — NYU (aav7237@nyu.edu)

---

## 📄 License

MIT
