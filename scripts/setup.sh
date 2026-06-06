#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Pravaas local setup"

# 1. Environment files
if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
  echo "Created apps/api/.env — edit OPENAI_API_KEY before uploading bookings"
fi

if [ ! -f apps/mobile/.env ]; then
  cp apps/mobile/.env.example apps/mobile/.env
  echo "Created apps/mobile/.env"
fi

# 2. Start PostgreSQL
echo "==> Starting PostgreSQL (Docker)"
docker compose up -d postgres

echo "==> Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U postgres -d pravaas > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is ready"

# 3. Install dependencies
echo "==> Installing dependencies"
if command -v pnpm >/dev/null 2>&1; then
  pnpm install
else
  npx pnpm@9.15.0 install
fi

PNPM="pnpm"
if ! command -v pnpm >/dev/null 2>&1; then
  PNPM="npx pnpm@9.15.0"
fi

# 4. Generate Prisma client
echo "==> Generating Prisma client"
$PNPM db:generate

# 5. Run migrations
echo "==> Running database migrations"
$PNPM db:migrate:deploy

# 6. Seed demo data
echo "==> Seeding database"
$PNPM db:seed

# 7. Build shared packages
echo "==> Building shared packages"
$PNPM build

# 8. Create uploads directory
mkdir -p apps/api/uploads
touch apps/api/uploads/.gitkeep

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Set OPENAI_API_KEY in apps/api/.env"
echo "  2. Start API:       pnpm dev:api"
echo "  3. Start mobile:    pnpm dev:mobile"
echo "  4. Health check:    curl http://localhost:3000/health"
echo ""
echo "Demo credentials: guest@pravaas.dev / password123"
