# Operator Playbook

## Daily Workflow

1. Scan trends with `npm run scan:trends`.
2. Scan and score products with `npm run scan:products`.
3. Generate content for the strongest opportunities with `npm run generate:content`.
4. Generate assets with `npm run generate:assets`.
5. Mock-publish queued content with `npm run publish:mock`.
6. Import metrics with `npm run analytics:mock`.
7. Review `/analytics`, `/products`, `/content`, and `/logs`.

## Weekly Workflow

1. Run `npm run autopilot:full`.
2. Review top products, top hooks, top platforms, click-through rate, and revenue estimate.
3. Expand winners with additional variants.
4. Check landing pages for disclosure placement and link tracking.
5. Run `npm run lint`, `npm run test`, and `npm run build`.

## Content Workflow

- Match each product to a trend and viral angle.
- Generate one Pinterest pin, one TikTok script, and one web content item per top product.
- Keep TikTok scripts in the 15-30 second range.
- Keep Pinterest copy keyword-rich without keyword stuffing.
- Add disclosure copy to all outputs.

## Analytics Workflow

- Review impressions, saves, likes, clicks, conversions, revenue, CTR, top products, niches, hooks, and platforms.
- Treat high clicks plus low conversions as a landing page or product mismatch.
- Treat high saves and low clicks as a stronger Pinterest CTA opportunity.
- Treat high revenue per click as a winner expansion candidate.

## Winner Expansion Workflow

1. Mark products with strong opportunity and metrics as `winner`.
2. Generate more angles and assets.
3. Build comparison and guide pages.
4. Schedule/mock-publish variants across Pinterest and TikTok.
5. Keep the original content pattern, but change the hook, proof sequence, and visual composition.

## Manual Override Workflow

- Use dashboard pages for inspection and action buttons for controlled runs.
- Pause products by changing their status in the state or database.
- Disable real publisher adapters in settings/env if platform review or credentials are not ready.
- Keep mock/export mode active until owned-account credentials are verified.
