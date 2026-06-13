# Suggested Schedules

Use OpenClaw scheduled tasks or standing orders to run these commands.

## Daily Product Scan

- Time: 08:00 local
- Command: `npm run scan:products`
- Expected output: updated product opportunity scores

## Daily Trend Scan

- Time: 08:10 local
- Command: `npm run scan:trends`
- Expected output: refreshed trend velocity and confidence

## Daily Content Generation

- Time: 08:30 local
- Command: `npm run generate:content`
- Expected output: new Pinterest, TikTok, and web drafts

## Daily Publish Queue

- Time: 09:00 local
- Command: `npm run publish:mock`
- Expected output: mock-published posts and export packages

## Weekly Analytics Review

- Time: Monday 10:00 local
- Command: `npm run analytics:mock`
- Expected output: mock performance imports and refreshed dashboard metrics

## Weekly Winner Expansion

- Time: Monday 10:30 local
- Command: `npm run autopilot:full`
- Expected output: winner variants, assets, mock publishes, and analytics

## Weekly Repo Health Check

- Time: Friday 15:00 local
- Commands:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
- Expected output: clean verification before the next operating cycle
