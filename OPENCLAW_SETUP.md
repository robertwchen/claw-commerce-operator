# OpenClaw Setup

## Install and Use

OpenClaw reads workspace files and skills from this repo. Start OpenClaw from the repository root so it can see:

- `AGENTS.md`
- `skills/claw-commerce/SKILL.md`
- `openclaw/operator.md`
- `openclaw/schedules.md`

## Enable the Skill

The skill is in `skills/claw-commerce/SKILL.md` with:

- `name: claw-commerce`
- `description: Operate the Claw Commerce affiliate workflow...`

Restart or refresh the OpenClaw session after editing skills so the workspace skill list reloads.

## Connect Credentials

Copy `.env.example` to `.env` and fill in the live inputs you want enabled:

- `OPERATOR_MODE=real` to disable silent demo generation
- `NEXT_PUBLIC_APP_URL` as a public HTTPS owned domain
- `PRODUCT_CATALOG_JSON`, `TREND_FEED_JSON`, and `ANALYTICS_IMPORT_JSON` for owned exports
- `DATABASE_URL` for Postgres
- `REDIS_URL` for BullMQ/Redis worker mode
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` for real AI copy generation
- `OPENAI_API_KEY` plus `ASSET_PROVIDER=openai` for real raster asset generation
- `PINTEREST_ACCESS_TOKEN` and `PINTEREST_BOARD_ID` for Pinterest API mode
- `TIKTOK_ACCESS_TOKEN` for TikTok Content Posting API mode
- `TIKTOK_PHOTO_URLS` with verified public image URLs for TikTok photo posting
- Amazon Associates/API values only when an approved account is available

In `OPERATOR_MODE=real`, missing credentials are logged and skipped instead of being faked. Demo fallback is only for local development when real mode is not enabled.

## Run Manually

```bash
npm install
npm run seed
npm run dev
```

Open the dashboard at `http://localhost:3000` or the port printed by Next.

## Run Autopilot

```bash
npm run autopilot:dry
npm run autopilot:full
```

`dry_run` logs what would happen. `full_autopilot` generates content and assets, publishes through configured official APIs, imports real metrics when configured, and marks winners.

## Run Scheduled Jobs

Use `openclaw/schedules.md` as the schedule source. Each schedule maps to an npm script and can be installed as an OpenClaw scheduled task or standing order.

## Docker Mode

```bash
docker compose up --build
```

This starts app, Postgres, Redis, and worker services. Then seed Prisma/Postgres from inside the app container if needed:

```bash
docker compose exec app npm run prisma:migrate -- --name init
docker compose exec app npm run seed
```
