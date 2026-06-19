# 🚑 VitalRoute
### AI-Powered Ambulance Routing — Get to the Right Hospital, Not Just the Nearest One

> Built at Vibecriminals Hackathon 2026

---

## 🧠 The Problem

Every year, thousands of patients in India are taken to the *nearest* hospital — not the *right* one. The nearest hospital may have no ICU beds, no specialist on duty, or lack the right blood type. By the time the mistake is realized, the Golden Hour is gone.

**VitalRoute fixes this in 8 seconds.**

---

## ✨ What It Does

VitalRoute is a real-time SaaS platform with two dashboards:

### 🚑 Ambulance Operator Dashboard
- Fill a quick patient intake form (condition, severity, blood group, age)
- AI triages the condition and determines required specialty + equipment
- Get Top 3 hospital recommendations ranked by match score, ETA, and distance
- One-tap alert to the hospital — they're notified instantly
- If the hospital declines → **auto-failover**: system re-routes from your current GPS location to the next best hospital automatically

### 🏥 Hospital Dashboard
- Receive incoming patient alerts in real time
- View AI-generated patient summary card with ETA countdown
- Accept or Decline (with reason)
- Get an AI-generated prep checklist: "Prepare defibrillator · O- blood · Cardiologist on standby"
- Track all incoming cases for the shift

---

## 🔄 Auto-Failover Flow

```
Hospital #1 Declines
        ↓
System detects decline via Supabase Realtime
        ↓
Re-fetches current ambulance GPS (ambulance has been moving)
        ↓
Claude re-triages with updated location + escalated urgency
        ↓
Hospital #2 auto-selected and alerted
        ↓
Ambulance UI redirects with new route — no manual action needed
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS |
| AI Triage | Claude API (Anthropic) |
| Realtime Sync | Supabase Realtime |
| Database | Supabase (PostgreSQL) |
| Maps & Routing | Google Maps Platform |
| Location | Browser Geolocation API |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- Google Cloud project with Maps, Directions & Places APIs enabled
- Anthropic API key

### 1. Clone the repo
```bash
git clone https://github.com/your-team/vitalroute.git
cd vitalroute
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### 4. Set up Supabase tables
Run the SQL in `/supabase/schema.sql` in your Supabase SQL editor.

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
vitalroute/
├── app/
│   ├── page.tsx                  # Landing — role selector
│   ├── ambulance/
│   │   ├── page.tsx              # Ambulance dashboard
│   │   ├── intake/page.tsx       # Patient intake form
│   │   └── results/page.tsx      # Hospital recommendations + map
│   └── hospital/
│       ├── page.tsx              # Hospital dashboard
│       ├── incoming/page.tsx     # Live incoming alerts
│       └── prep/page.tsx         # AI prep checklist
├── api/
│   ├── triage/route.ts           # Claude API — AI triage
│   ├── recommend/route.ts        # Hospital recommendation logic
│   ├── alert/route.ts            # Send alert to hospital
│   └── reroute/route.ts          # Auto-failover rerouting
├── components/
│   ├── PatientCard.tsx
│   ├── HospitalCard.tsx
│   ├── MapView.tsx
│   ├── PrepChecklist.tsx
│   └── StatusBadge.tsx
├── lib/
│   ├── supabase.ts
│   ├── claude.ts
│   └── maps.ts
├── supabase/
│   └── schema.sql
└── .env.local
```

---

## 🔑 API Keys Setup

### Google Maps Platform
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable these APIs:
   - Maps JavaScript API
   - Directions API
   - Places API
   - Geocoding API
3. Create an API key → copy to `.env.local`

### Anthropic
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key → copy to `.env.local`

### Supabase
1. Go to [supabase.com](https://supabase.com) → New project
2. Copy Project URL and anon key → paste in `.env.local`
3. Run `/supabase/schema.sql` in the SQL editor

---

## 🎯 Demo Instructions

For the hackathon demo, open two browser windows side by side:
- **Left:** `localhost:3000/ambulance`
- **Right:** `localhost:3000/hospital`

1. Fill the patient intake form on the left
2. Watch the alert appear on the right in real time
3. Click **Decline** on the hospital side
4. Watch the ambulance UI auto-reroute to Hospital #2

---

## 👥 Team

Built with ❤️ at Vibecriminals Hackathon 2026

---

## 📄 License

MIT