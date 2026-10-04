# Pravaas

Pravaas is a **hotel SaaS + guest travel companion** for stays in India. It connects hotel operations with a modern guest **web/PWA** experience, combining booking information, travel identity, AI assistance, itinerary planning, live places/routes, and India-specific traveller information.

**Product website:** pravaasdigital.in

> **Current product direction:** the web app is the active guest experience and is also a PWA. The old Expo guest mobile app is discontinued and is not part of the current product.

## Product

### Guest experience

The current guest experience is a Next.js web/PWA application with:

- **Booking import** — booking screenshots/details can be processed with AI and saved to the guest account.
- **Travel wallet / identity** — passport and visa/identity information associated with a trip.
- **Itinerary planning** — AI-generated itineraries persisted against a booking, with day-by-day editing and regeneration.
- **Live places** — Google Places recommendations driven by travel moods such as Sightseeing, Food & cafés, Experiences, Shopping, Family, and Nightlife.
- **Interactive maps** — Google Maps with destination and place markers.
- **Day routes** — explicit "Show route" planning using Google Routes API, including multi-stop driving routes, distance, duration, and return to the hotel when resolvable.
- **Shika** — Pravaas's friendly, travel-only AI companion. Travel-relevant questions are answered with trip context; unrelated questions are redirected locally without an additional AI request.
- **Traveller information** — nationality-aware emergency guidance, India immigration/e-FRRO information, and live embassy/consulate discovery near the destination.
- **Drive Mode** — a foreground PWA driving experience with browser GPS, live route/ETA, trip distance and speed statistics, and on-demand nearby Food, Fuel, EV charging, and Roadside services.
- **More hub** — Profile, Traveller Information, and Drive Mode are available from a dedicated More section. Drive Mode is intended to become a premium feature.

### Hotel experience

The hotel-side experience is also part of the web/PWA application:

- Hotel dashboard and recent guest/check-in workflows.
- Booking and guest detail views.
- **Form III (Earlier Form C)** preparation for foreign guests under India's current Immigration and Foreigners Rules, 2025.
- Automatic pre-filling from booking, passport, visa/OCI, and guest information where available.
- Review/edit before saving.
- Print-optimised Form III preview with browser **Save as PDF**.
- Form III data persisted per booking.

Pravaas currently **prepares and prints Form III; it does not submit the form to the Indian government portal automatically**.

## Current architecture

```
pravaas-mobile/
├── apps/
│   ├── web/                    # Active Next.js guest + hotel web/PWA
│   │   ├── app/                # Guest, itinerary, hotel, info, drive
│   │   └── components/         # Maps, navigation and shared web UI
│   ├── api/                    # NestJS backend
│   │   ├── src/booking/        # Bookings, itinerary, Places, Routes, Drive Mode
│   │   ├── src/hotel/          # Hotel workflows + Form III
│   │   ├── src/openai/         # OpenAI integration
│   │   └── prisma/             # PostgreSQL schema + migrations
│   ├── mobile/                 # Legacy/discontinued Expo guest app
│   └── hotel/                  # Legacy Expo hotel scaffold; not the active hotel UI
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── api-client/             # Shared API client/hooks
│   └── ui/                     # Shared UI package
├── docker-compose.yml          # Local PostgreSQL
├── turbo.json
└── pnpm-workspace.yaml
```

### Main stack

| Area | Technology |
|---|---|
| Guest + hotel UI | Next.js 16, React 19, TypeScript |
| Delivery | Web application / PWA |
| Backend | NestJS |
| Database | PostgreSQL + Prisma |
| Monorepo | Turborepo + pnpm |
| AI | OpenAI API |
| Maps | Google Maps JavaScript API |
| Places | Google Places API (New) |
| Routing | Google Routes API |
| Authentication | JWT |
| QR | QR-code generation |

## Key application areas

### Booking and AI extraction

A guest can bring booking information into Pravaas. The backend can use OpenAI vision to extract structured booking data and persist it in PostgreSQL.

The booking becomes the anchor for downstream features:

```
Booking
  ├── Travel identity
  ├── Itinerary
  ├── Live places
  ├── Day routes
  ├── Traveller information
  ├── Form III (hotel workflow)
  └── Drive Mode
```

### Itinerary

The itinerary flow supports:

1. Selecting travel preferences/moods.
2. AI itinerary generation.
3. Persistence against the booking.
4. Day-by-day viewing and editing.
5. Live Google Places recommendations.
6. Explicit route calculation for a selected day.
7. Map-first presentation on desktop and stacked presentation on mobile.

Route calculations are deliberately **user-triggered** rather than continuously requested, helping control Google Maps usage and cost.

### Shika AI travel companion

Shika is intentionally scoped to travel.

The current design uses a local relevance gate before calling OpenAI:

```
Guest question
      ↓
Local travel relevance check
      ↓
Travel-related? ── yes ──→ OpenAI / Shika
             └── no ─────→ Fixed travel redirect
```

This avoids spending AI tokens on clearly unrelated questions while keeping the experience useful for trip planning, destinations, hotels, routes, food, sightseeing, driving, travel documents, and similar topics.

### Google Maps / Places / Routes

Pravaas uses two classes of Google Maps keys:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — browser key for the Maps JavaScript API. Restrict it by website/referrer.
- `GOOGLE_MAPS_API_KEY` — server-side key for Places and Routes API calls. Keep it secret and use appropriate server-side restrictions.

The server uses Places API (New) for destination/place resolution, recommendations, embassies, and Drive Mode nearby search. Routes API is used for planned and live driving routes.

### Foreign traveller information

The Traveller Information page uses the guest's nationality and upcoming trip destination to provide:

- Emergency number **112**.
- India's tourist helpline **1363**.
- India e-FRRO information.
- Live embassy/consulate/high commission discovery near the destination.
- Call, website, address, and Google Maps options where returned by Google Places.

Embassy/contact information is retrieved live and may change; it should not be treated as a permanent authoritative directory.

### Form III / Earlier Form C

Pravaas follows the current Indian Form III workflow rather than the obsolete 1992 Form C field set.

The hotel workflow can:

- Prefill available guest/passport/visa information.
- Leave unavailable information editable.
- Save the completed form against the booking.
- Produce an official-style print preview.
- Let hotel staff use the browser's Save as PDF flow.

Government submission remains outside the current Pravaas workflow.

### Drive Mode

Drive Mode is currently a **foreground PWA MVP**.

It can provide:

- Browser GPS location with guest permission.
- Current location on the map.
- Live driving route to the selected destination/activity.
- Remaining distance and ETA.
- Session distance driven.
- Current/average/max speed estimates.
- On-demand nearby Food, Fuel, EV charging, and Roadside services.
- Optional Shika browser voice prompts.
- Safe-driving reminders.

A PWA cannot reliably provide the same always-on background navigation experience as a dedicated native navigation application. **Native Navigation SDK / stronger background turn-by-turn support is a future roadmap item.**

## Environment variables

### API

Typical server variables include:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
OPENAI_API_KEY=...
GOOGLE_MAPS_API_KEY=...
```

### Web

Typical browser/application variables include:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

Do not commit real API keys to source control.

## Local development

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop (for local PostgreSQL)
- OpenAI API key for AI features
- Google Maps Platform key(s) for Maps, Places, and Routes features

### Install

```bash
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
```

Run the applications:

```bash
# Web / PWA
pnpm --filter web dev

# API
pnpm dev:api
```

The package scripts in `apps/web/package.json` and `apps/api/package.json` are the source of truth as the monorepo evolves.

### Database commands

| Command | Purpose |
|---|---|
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Create/apply a development migration |
| `pnpm db:migrate:deploy` | Apply migrations for deployment |
| `pnpm db:seed` | Seed development data |
| `pnpm db:reset` | Reset and recreate the database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm docker:up` | Start PostgreSQL |
| `pnpm docker:down` | Stop PostgreSQL |

## Important production notes

- **Hotel authentication/security:** hotel-facing production authentication and authorization still need hardening before broad production rollout.
- **Google Maps security:** browser and server API keys must use appropriate restrictions; never expose the server key to the browser.
- **Drive Mode:** current implementation is foreground PWA, not guaranteed background navigation.
- **Form III:** Pravaas prepares/prints the form but does not automatically submit it to the government portal.
- **Traveller contacts:** embassy and other live place information can change and should be verified when critical.
- **Location privacy:** Drive Mode requests browser location permission. Location is used locally and sent to Pravaas APIs only when route/nearby features require it.

## Current product status

| Capability | Status |
|---|---|
| Guest web/PWA | **Active** |
| Hotel web dashboard | **Active** |
| Booking + AI extraction | **Active** |
| Travel wallet / identity | **Active** |
| AI itinerary generation | **Active** |
| Live Google Places | **Active** |
| Day route planning | **Active** |
| Shika travel assistant | **Active** |
| Traveller / embassy information | **Active** |
| Form III / Earlier Form C preparation | **Active** |
| Drive Mode foreground MVP | **Active / Premium planned** |
| Native background turn-by-turn navigation | **Future** |
| Automated production submission of Form III | **Not implemented** |

## Product direction

Pravaas is evolving from a hotel booking utility into a **hotel-connected travel operating layer**:

```
Hotel
  ↓
Booking + Guest Identity
  ↓
Stay
  ↓
Travel Companion
  ├── Itinerary
  ├── Places
  ├── Routes
  ├── Shika
  ├── Traveller information
  └── Drive Mode
```

The long-term goal is to make the hotel stay the starting point for a complete, context-aware travel experience while giving hotels useful operational and compliance workflows.

## Repository status

The active product is the **Next.js web/PWA + NestJS API** stack.

The old Expo applications remain in the repository as legacy/scaffold code for historical reasons, but they should **not** be treated as active product surfaces.

## License

Private
