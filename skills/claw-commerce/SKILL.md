---
name: claw-commerce
description: Operate the Claw Commerce affiliate workflow across product discovery, trend mining, content generation, official API publishing, analytics, and autopilot.
---

# Claw Commerce

Use this skill when the user asks OpenClaw to run, inspect, extend, or troubleshoot the Claw Commerce Operator.

## Product Discovery Workflow

1. Run `npm run scan:products`.
2. Review `Products` in the dashboard or `storage/demo-state.json`.
3. Prioritize products by `opportunityScore`.
4. Keep the required fields complete: title, brand, category, price, commission estimate, product URL, affiliate URL, image URL, rating, review count, source, niche, trend score, opportunity score, and status.

## Trend Discovery Workflow

1. Run `npm run scan:trends`.
2. Check platform, velocity, confidence, example hook styles, matching products, and trend status.
3. Favor rising trends that match products with clear visual proof and buyer intent.

## Content Generation Workflow

1. Run `npm run generate:content` or use the dashboard action.
2. Generate original Pinterest pins, TikTok scripts, and landing-page copy.
3. Never copy exact creator media or captions.
4. Ensure the output includes the disclosure line.
5. Store generated items in the content queue.

## Asset Generation Workflow

1. Run `npm run generate:assets`.
2. Produce Pinterest cards, product collages, comparison graphics, before/after graphics, and TikTok storyboard frames.
3. Use product images or generated placeholders from this app.
4. Verify assets render in `/assets`.

## Publishing and Export Workflow

1. Use real publishers only when credentials and platform review requirements are satisfied.
2. Otherwise run `npm run publish:real`.
3. Export platform-ready post packages under `exports/`.
4. Log publisher status, retries, and skipped credential reasons.

## Analytics Workflow

1. Import real metrics through configured adapters or run `npm run analytics:real`.
2. Review impressions, saves, likes, clicks, conversions, revenue, top products, niches, hooks, and platforms.
3. Mark strong products as winners and expand content variants.

## Autopilot Workflow

Run one of:

- `npm run autopilot:dry`
- `npm run autopilot:full`

The loop ingests trends, ingests products, scores opportunities, generates content, generates assets, creates landing pages, publishes through official APIs, imports analytics, and expands winners.

## Git Commit and Push Workflow

1. Check `git status --short`.
2. Stage only intended files.
3. Commit with a clear milestone message.
4. Push `origin openclaw-commerce-operator`.
5. If GitHub CLI is unavailable, use plain Git and report that draft PR creation is blocked.

## Error Recovery

- Missing database: continue with demo JSON state and document that Postgres is optional for demo mode.
- Missing Redis: worker falls back to an inline dry-run job.
- Missing AI keys in real mode: skip generation and log the missing provider credential.
- Missing Pinterest/TikTok credentials in real mode: skip that platform and export packages for owner review.
- Failed build or tests: fix the smallest failing surface first, rerun verification, then commit.
