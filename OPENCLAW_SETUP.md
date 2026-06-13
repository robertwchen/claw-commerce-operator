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

Copy `.env.example` to `.env` and fill in only the credentials you have:

- `DATABASE_URL` for Postgres
- `REDIS_URL` for BullMQ/Redis worker mode
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` for future real AI providers
- `PINTEREST_ACCESS_TOKEN` for Pinterest API mode
- `TIKTOK_ACCESS_TOKEN` for TikTok Content Posting API mode
- Amazon Associates/API values when an approved account is available

Missing credentials do not block demo mode. The operator uses deterministic mock providers and mock publishers.

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

`dry_run` logs what would happen. `full_autopilot` generates content, assets, mock publishes, imports mock metrics, and marks winners.

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
