# API Adapter Notes

## AI Providers

Current implementation:

- `src/lib/providers/ai.ts`
- Mock provider is deterministic and always available.
- OpenAI and Anthropic keys are detected but still routed to mock output until real adapters are implemented.

Expected real adapter contract:

- Generate Pinterest copy
- Generate TikTok copy
- Generate landing-page copy
- Always return disclosure fields
- Avoid copying exact creator content

## Pinterest Publisher

Current implementation:

- `src/lib/publishers/mock.ts`
- Mock publishes queued content and creates export packages.

Real adapter requirements:

- Access token with board and pin scopes
- Create board
- Create pin
- Schedule pin when supported by account/API workflow
- Export fallback when credentials or scopes are missing

## TikTok Publisher

Current implementation:

- TikTok output is script/caption/storyboard package ready for manual posting or future API upload.
- Mock publishing keeps content in owned-account/export mode.

Real adapter requirements:

- Registered TikTok app
- Content Posting API enabled
- Approved `video.publish` scope
- User access token and explicit user authorization
- Private/draft mode until app audit allows broader visibility

## Web Publisher

Current implementation:

- Landing pages are served in-app through `/p/[slug]`, `/guides/[slug]`, and `/compare/[slug]`.
- `/go/[linkId]` tracks clicks and redirects to the affiliate URL.

## Storage

Current implementation:

- `src/lib/storage/adapter.ts`
- Local adapter writes to `storage/`.
- The interface is S3/R2-ready: `putObject` and `getObject` are the only required operations.

## Amazon Catalog

Current implementation:

- Mock Amazon-style seed catalog in `src/lib/data/seed.ts`.

Real adapter requirements:

- Use current approved Amazon affiliate/catalog APIs for the account.
- Keep Associates disclosure near links and site-level notice on pages using Amazon links.
