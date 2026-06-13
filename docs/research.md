# Research Notes

Last checked: 2026-06-13

These notes translate the current official docs into implementation choices for Claw Commerce Operator. The product is designed to work fully in demo/mock mode without paid credentials, then switch to official APIs through provider adapters when credentials and approvals exist.

## OpenClaw workspace, skills, and automation

- OpenClaw positions tools as callable actions, skills as repeatable workflow instructions, and plugins as runtime capability bundles. Skills are appropriate here because the commerce operator already has repo scripts and needs a repeatable operating workflow. Source: https://docs.openclaw.ai/tools
- Skills live in workspace `skills/` folders and each skill directory contains a `SKILL.md` with YAML frontmatter. Required frontmatter fields are `name` and `description`; optional gating can declare required binaries or environment variables. Source: https://docs.openclaw.ai/tools/creating-skills
- OpenClaw automation supports scheduled tasks, background tasks, task flows, hooks, standing orders, and inferred commitments. Daily scans and weekly reviews map to scheduled tasks; the repo `AGENTS.md` acts as standing operating authority. Source: https://docs.openclaw.ai/automation
- Standing orders grant autonomous authority within defined boundaries, triggers, and escalation rules. The operator should escalate for missing credentials, policy risks, repeated publisher failures, or unusually high spend/risk, while continuing mock/export mode otherwise. Source: https://docs.openclaw.ai/automation/standing-orders

## Pinterest API

- Organic content creation uses Pinterest API v5 endpoints for boards and Pins. Apps need a connected Pinterest app and an access token with `boards:read`, `boards:write`, `pins:read`, and `pins:write` scopes. Source: https://developers.pinterest.com/docs/work-with-organic-content-and-users/create-boards-and-pins/
- Pinterest supports creating image and video Pins plus product tagging for organic Pins. The implementation should expose a `PinterestPublisher` interface with real API methods, but default to mock-publish and export packages unless credentials/scopes exist. Source: https://developers.pinterest.com/docs/api/v5/

## TikTok Content Posting API

- TikTok direct posting requires a registered developer app, Content Posting API enabled, approved `video.publish` scope, and user authorization. Source: https://developers.tiktok.com/doc/content-posting-api-get-started
- Direct Post requires querying creator info, initializing a post request, then exporting/uploading video to TikTok. Unaudited clients are restricted to private viewing mode until audit approval. Source: https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
- The app should keep TikTok in draft/private/mock/export mode by default and generate platform-ready scripts, captions, hashtags, and storyboard frames when credentials are absent.

## Amazon affiliate and product APIs

- Amazon Product Advertising API 5.0 documentation now warns that PA-API is deprecated as of 2026-05-15 and directs developers to Creators API documentation. Source: https://webservices.amazon.com/paapi5/documentation/
- Because access is credentialed and API eligibility can vary by account, the operator should keep Amazon ingestion behind an adapter and seed/mock Amazon-style catalog data in demo mode.
- Amazon Associates requires link-level affiliate disclosure and a site-level Associates statement when Amazon affiliate links are used. Source: https://affiliate-program.amazon.com/help/node/topic/GHQNZAU6669EZS98

## Affiliate disclosure basics

- The FTC says creators should disclose financial, employment, personal, or family relationships with a brand, including affiliate or commission relationships. Source: https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers
- Disclosures should be hard to miss, placed with the endorsement message itself, and use simple language such as "ad", "advertisement", or "sponsored". Video endorsements should include the disclosure in the video and not only in the caption. Source: https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers
- Implementation rule: every generated post and landing page includes a simple disclosure line, and tracked outbound links can render a nearby "(affiliate link)" label.

## Implementation decisions

- Official APIs are represented as adapters with shared interfaces and deterministic mock implementations.
- Demo mode is first-class: seeding, scoring, content generation, asset generation, publishing, tracking, analytics, and autopilot all run locally without credentials.
- Real publishing is opt-in through environment variables and provider toggles. If a required credential is missing, the publisher logs the reason and writes export packages instead of failing the workflow.
- Content generation studies reusable viral patterns but never reposts exact creator captions, videos, or images.
- The operator only supports owned accounts and avoids engagement automation such as fake likes, follows, comments, or account farms.
