# ✅ VitalRoute — Hackathon Task List
> One day build plan. Assign each block to a team member.

---

## 🔧 Phase 0 — Setup (First 30 mins, Everyone)

- [ ] Create GitHub repo and add all team members
- [ ] Initialize Next.js project with Tailwind CSS
  ```bash
  npx create-next-app@latest vitalroute --typescript --tailwind --app
  ```
- [ ] Create Supabase project
- [ ] Enable Google Maps APIs on Google Cloud Console
  - [ ] Maps JavaScript API
  - [ ] Directions API
  - [ ] Places API
  - [ ] Geocoding API
- [ ] Get Anthropic API key
- [ ] Create `.env.local` with all keys
- [ ] Deploy skeleton to Vercel (connect GitHub repo)
- [ ] Create Supabase tables (run schema.sql)

---

## 🗄️ Phase 1 — Database & Backend (Dev 3 + Dev 4)

### Supabase Schema
- [ ] Create `hospitals` table with mock data (15-20 hospitals)
  - id, name, lat, lng, specialties[], icu_available, available_beds, blood_types[], address
- [ ] Create `cases` table
  - id, patient_condition, severity, age, blood_group, allergies, pickup_lat, pickup_lng, current_lat, current_lng, ai_triage_result, status, assigned_hospital_id, declined_hospitals[]
- [ ] Create `alerts` table
  - id, case_id, hospital_id, status, decline_reason, created_at, responded_at
- [ ] Enable Realtime on `alerts` table in Supabase dashboard
- [ ] Seed `hospitals` table with mock specialties + availability data

### API Routes
- [ ] `POST /api/triage` — send patient data to Claude, return specialty + urgency + equipment needed
- [ ] `POST /api/recommend` — score hospitals by match + distance + ETA, return top 3
- [ ] `POST /api/alert` — insert alert row into Supabase
- [ ] `POST /api/reroute` — re-triage + re-recommend on decline (takes current GPS)
- [ ] `GET /api/case/:id` — return live case data

### Supabase Client
- [ ] Set up `lib/supabase.ts` with client
- [ ] Set up `lib/claude.ts` with triage prompt helper
- [ ] Set up `lib/maps.ts` with distance + ETA calculator

---

## 🚑 Phase 2 — Ambulance Dashboard (Dev 1)

### Landing Page (`/`)
- [ ] Role selector screen — "I am an: Ambulance Operator / Hospital Staff"
- [ ] Two big cards, clicking each routes to respective dashboard
- [ ] VitalRoute logo + tagline: "Get to the right hospital, not just the nearest one"

### Patient Intake Form (`/ambulance/intake`)
- [ ] Condition selector (Cardiac / Trauma / Neuro / Burns / Maternity / Respiratory)
- [ ] Severity slider (1–10) with color indicator (green → red)
- [ ] Age input
- [ ] Blood group dropdown (A+, A-, B+, B-, O+, O-, AB+, AB-)
- [ ] Allergies text field (optional)
- [ ] Auto-detect location button using `navigator.geolocation`
- [ ] "Find Best Hospital" submit button
- [ ] Loading state while AI triages

### Hospital Recommendation Screen (`/ambulance/results`)
- [ ] Top 3 hospital cards showing:
  - [ ] Hospital name + address
  - [ ] Match score (%) with color badge
  - [ ] Distance (km) + ETA (mins)
  - [ ] Specialty badges (e.g. "Cardiac Unit", "ICU Available")
  - [ ] Blood availability indicator
- [ ] "Send Alert" button on top card (highlighted)
- [ ] Google Maps embed showing route to recommended hospital
- [ ] Status indicator: Pending → Confirmed / Declined

### Auto-Failover UI
- [ ] Listen to Supabase `alerts` table for status changes
- [ ] On decline: show "🔴 [Hospital] Declined — Reason: ICU Full"
- [ ] Show "🔄 Finding next hospital from your current location..."
- [ ] Animate transition to new hospital card
- [ ] Show "✅ Redirected to [Hospital #2] — New ETA: X mins"
- [ ] Update map route automatically

---

## 🏥 Phase 3 — Hospital Dashboard (Dev 2)

### Hospital Dashboard (`/hospital`)
- [ ] Hospital name header + shift info
- [ ] Live incoming alerts list (Supabase Realtime subscription)
- [ ] Alert count badge
- [ ] Case log table (all cases this session)

### Incoming Alert Card (`/hospital/incoming`)
- [ ] Patient condition headline (AI-generated plain English summary)
- [ ] Severity badge (color coded)
- [ ] Patient details: Age, Blood Group, Allergies
- [ ] ETA countdown timer (live)
- [ ] Mini-map showing ambulance current location + route
- [ ] **Accept** button (green) — confirms to ambulance
- [ ] **Decline** button (red) — opens reason dropdown:
  - ICU at capacity
  - No specialist available
  - Equipment unavailable
  - Other
- [ ] Confirm decline button

### AI Prep Checklist (`/hospital/prep`)
- [ ] Auto-generated on Accept
- [ ] Claude generates checklist based on patient condition
- [ ] Example for Cardiac: "Prepare defibrillator · O- blood on standby · Cardiologist alerted · ICU Bay cleared"
- [ ] Interactive checkboxes — staff can tick items off
- [ ] ETA countdown visible throughout
- [ ] "Patient Arrived" button to close case

---

## 🗺️ Phase 4 — Maps Integration (Dev 4)

- [ ] Load Google Maps JS API in Next.js
- [ ] Show map on ambulance results screen with:
  - [ ] Ambulance marker (current location)
  - [ ] Hospital pins (top 3, color coded by rank)
  - [ ] Route drawn to #1 recommended hospital
- [ ] On reroute: animate route change to Hospital #2
- [ ] Show mini-map on hospital incoming alert card (ambulance location)
- [ ] Calculate and display ETA using Directions API

---

## 🎨 Phase 5 — UI Polish (Dev 5 / All)

- [ ] Color theme: Emergency red + clean white + dark navy
- [ ] Ambulance UI: feels urgent, high contrast, large touch targets
- [ ] Hospital UI: feels clinical, organized, calm
- [ ] Loading skeletons on all async operations
- [ ] Toast notifications for real-time events
- [ ] Mobile responsive (judges may check on phone)
- [ ] Favicon + page titles set

---

## 🚀 Phase 6 — Deployment & Demo Prep (Dev 5)

- [ ] Push all to GitHub
- [ ] Verify Vercel deployment is live
- [ ] Test full flow end-to-end on production URL
- [ ] Test auto-failover flow on production
- [ ] Open two tabs side by side — confirm real-time sync works on prod
- [ ] Prepare demo script (2-minute walkthrough)
- [ ] Prepare pitch deck (problem → solution → demo → market → team)

---

## 🧪 Testing Checklist (Before Demo)

- [ ] Patient intake form submits correctly
- [ ] AI triage returns in < 5 seconds
- [ ] Top 3 hospitals appear with correct data
- [ ] Alert reaches hospital dashboard in < 2 seconds
- [ ] Accept flow completes — ambulance sees confirmation
- [ ] Decline flow triggers auto-failover correctly
- [ ] New hospital receives alert after failover
- [ ] Map updates route on failover
- [ ] ETA countdown works on hospital side
- [ ] Prep checklist generates correctly
- [ ] No console errors during demo flow

---

## ⏰ Suggested Time Split (8-Hour Hackathon)

| Time | Phase |
|---|---|
| 0:00 – 0:30 | Phase 0 — Setup + env |
| 0:30 – 2:00 | Phase 1 — DB + API routes |
| 0:30 – 3:00 | Phase 2 — Ambulance UI |
| 0:30 – 3:00 | Phase 3 — Hospital UI |
| 2:00 – 4:00 | Phase 4 — Maps integration |
| 4:00 – 5:30 | Integration + real-time sync testing |
| 5:30 – 6:30 | Phase 5 — UI polish |
| 6:30 – 7:30 | Phase 6 — Deploy + demo prep |
| 7:30 – 8:00 | Buffer / fixes + pitch rehearsal |