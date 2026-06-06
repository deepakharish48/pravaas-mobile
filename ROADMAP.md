# Pravaas Development Roadmap

## Audit Summary (Current State)

| Area | Status | Notes |
|------|--------|-------|
| Turborepo structure | ✅ Complete | 3 apps + 3 shared packages |
| Prisma schema | ✅ Complete | User, Booking, indexes |
| PostgreSQL | ✅ Complete | Docker Compose added |
| Migrations | ✅ Complete | Initial migration + deploy scripts |
| Auth module | ✅ Complete | JWT signup/login/me |
| Booking upload | ✅ Complete | Multer → disk → DB |
| GPT-4o extraction | ✅ Complete | Vision API with graceful fallback |
| QR generation | ✅ Complete | qrcode lib, ownership check fixed |
| Guest mobile app | ✅ Complete | All 5 screens wired |
| Hotel app | 🟡 Scaffold | QR scanner not built |
| Local dev tooling | ✅ Complete | setup script, docker, seed |
| Tests / CI | ❌ Missing | Phase 4 |
| Production deploy | ❌ Missing | Phase 5 |

---

## Phase 1 — Backend Foundation ✅

**Goal:** Runnable API with auth, booking upload, AI extraction, and QR codes.

| # | Task | Status |
|---|------|--------|
| 1 | Configure Prisma schema | ✅ `apps/api/prisma/schema.prisma` |
| 2 | Configure PostgreSQL | ✅ `docker-compose.yml` |
| 3 | Run migrations | ✅ `prisma/migrations/20250607000000_init/` |
| 4 | Implement Auth module | ✅ JWT + bcrypt |
| 5 | Implement Booking upload API | ✅ `POST /bookings/upload` |
| 6 | Implement GPT-4o extraction | ✅ `openai/openai.service.ts` |
| 7 | Implement QR generation | ✅ `qr/qr.service.ts` + controller |

**Deliverables:**
- `GET /health` — DB connectivity check
- Demo seed user: `guest@pravaas.dev` / `password123`
- `scripts/setup.sh` — one-command local bootstrap

---

## Phase 2 — Guest Mobile Polish

**Goal:** Production-quality guest experience.

| # | Task |
|---|------|
| 1 | Error boundaries + toast notifications |
| 2 | Offline/retry handling for uploads |
| 3 | Booking list pull-to-refresh polish |
| 4 | Image compression before upload |
| 5 | Deep linking to booking details |
| 6 | App icon + splash assets |
| 7 | EAS Build configuration |

---

## Phase 3 — Hotel Staff App

**Goal:** Front-desk QR scanning and guest verification.

| # | Task |
|---|------|
| 1 | QR scanner screen (`expo-camera` / `expo-barcode-scanner`) |
| 2 | Parse QR payload → fetch booking |
| 3 | Check-in flow (update status → `CHECKED_IN`) |
| 4 | Hotel staff auth (separate role or API key) |
| 5 | Guest lookup by confirmation number |
| 6 | Today's arrivals dashboard |

**New API endpoints needed:**
- `PATCH /bookings/:id/check-in` (hotel role)
- `GET /bookings/lookup?confirmation=` (hotel role)

---

## Phase 4 — Testing & CI

**Goal:** Automated quality gates.

| # | Task |
|---|------|
| 1 | API unit tests (Jest) — Auth, Booking, QR |
| 2 | API e2e tests — upload flow with mocked OpenAI |
| 3 | GitHub Actions — lint, build, test |
| 4 | Prisma migration check in CI |
| 5 | Shared package versioning strategy |

---

## Phase 5 — Production Deployment

**Goal:** Deploy to staging/production.

| # | Task |
|---|------|
| 1 | Replace local file storage with S3/R2 |
| 2 | Managed PostgreSQL (RDS, Supabase, Neon) |
| 3 | API deployment (Railway, Fly.io, ECS) |
| 4 | EAS Submit for App Store / Play Store |
| 5 | Environment secrets management |
| 6 | Rate limiting + request logging |
| 7 | OpenAI cost monitoring |

---

## Phase 6 — Advanced Features

| # | Task |
|---|------|
| 1 | Push notifications (booking reminders) |
| 2 | Multi-language booking extraction |
| 3 | Hotel partner onboarding portal |
| 4 | Analytics dashboard |
| 5 | OAuth (Google/Apple Sign-In) |
