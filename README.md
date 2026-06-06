# Pravaas

Turborepo monorepo for hotel booking management — guest mobile app, hotel staff app, and NestJS API with AI-powered booking extraction.

> See [ROADMAP.md](./ROADMAP.md) for the full development plan.

## Folder Structure

```
pravaas/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   ├── uploads/            # Local booking screenshots
│   │   └── src/
│   │       ├── auth/           # JWT signup/login
│   │       ├── booking/        # Upload, GPT-4o extraction, save
│   │       ├── openai/         # GPT-4o vision module
│   │       ├── qr/             # QR code generation
│   │       ├── health/         # Health check endpoint
│   │       └── prisma/         # Database service
│   ├── mobile/                 # Guest Expo app
│   └── hotel/                  # Hotel staff Expo app (scaffold)
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── api-client/             # API client + TanStack Query hooks
│   └── ui/                     # Shared React Native UI components
├── docker-compose.yml          # PostgreSQL
├── scripts/setup.sh            # One-command local bootstrap
├── turbo.json
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js 20+
- pnpm 9+ (or use `npx pnpm@9.15.0`)
- Docker Desktop (for PostgreSQL)
- OpenAI API key (for booking extraction)

## Quick Start (One Command)

```bash
cd pravaas
bash scripts/setup.sh
```

This will:
1. Copy `.env` files from examples
2. Start PostgreSQL via Docker
3. Install dependencies
4. Run Prisma migrations
5. Seed demo user
6. Build shared packages

Then edit `apps/api/.env` and set your `OPENAI_API_KEY`.

## Manual Setup

```bash
# 1. Environment
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env

# 2. PostgreSQL
docker compose up -d

# 3. Dependencies + DB
pnpm install          # or: npx pnpm@9.15.0 install
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:seed
pnpm build
```

## Development

```bash
# Terminal 1 — API (port 3000)
pnpm dev:api

# Terminal 2 — Guest mobile app
pnpm dev:mobile

# Terminal 3 — Hotel app (optional)
pnpm dev:hotel
```

Verify API is running:

```bash
curl http://localhost:3000/health
```

### Demo Credentials

| Email | Password |
|-------|----------|
| `guest@pravaas.dev` | `password123` |

### Physical Device

Set your machine's LAN IP in `apps/mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

## Database Commands

| Command | Description |
|---------|-------------|
| `pnpm db:migrate` | Create new migration (dev) |
| `pnpm db:migrate:deploy` | Apply migrations (prod/CI) |
| `pnpm db:seed` | Seed demo user |
| `pnpm db:reset` | Reset DB + re-migrate + re-seed |
| `pnpm db:studio` | Open Prisma Studio GUI |
| `pnpm docker:up` | Start PostgreSQL |
| `pnpm docker:down` | Stop PostgreSQL |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health + DB check |
| POST | `/auth/signup` | No | Create account |
| POST | `/auth/login` | No | Sign in |
| GET | `/auth/me` | JWT | Get profile |
| POST | `/bookings/upload` | JWT | Upload screenshot → GPT-4o → save |
| GET | `/bookings` | JWT | List user bookings |
| GET | `/bookings/:id` | JWT | Get booking details |
| GET | `/qr/:bookingId` | JWT | Get QR code for check-in |

## Booking Flow

```
Guest uploads screenshot
        ↓
POST /bookings/upload (multipart/form-data)
        ↓
Save image → apps/api/uploads/
        ↓
GPT-4o vision extracts fields
        ↓
Save Booking to PostgreSQL
        ↓
Generate QR code → attach to booking
        ↓
Return booking JSON to mobile app
```

## Phase 1 Status

All Phase 1 backend tasks are complete. See [ROADMAP.md](./ROADMAP.md) for Phases 2–6.

## License

Private
