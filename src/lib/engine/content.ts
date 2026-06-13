import type { CommerceState, ContentItem, ContentPlatform, Product } from "@/lib/domain";
import { getAIProvider } from "@/lib/providers/ai";
import { nowIso, uid } from "@/lib/utils";

function pickBestAngle(state: CommerceState, product: Product, platform: ContentPlatform) {
  return (
    state.angles.find((angle) => (angle.platform === platform || angle.platform === "all") && angle.niche === product.niche) ??
    state.angles.find((angle) => angle.platform === platform || angle.platform === "all") ??
    state.angles[0]
  );
}

function pickTrend(state: CommerceState, product: Product) {
  return (
    state.trends.find((trend) => trend.matchingProducts.includes(product.slug)) ??
    state.trends.find((trend) => trend.niche === product.niche) ??
    state.trends[0]
  );
}

export async function generateContentForProduct(state: CommerceState, product: Product, platform: ContentPlatform) {
  const provider = getAIProvider();
  const trend = pickTrend(state, product);
  const angle = pickBestAngle(state, product, platform);
  const now = nowIso();

  if (platform === "pinterest") {
    const body = await provider.generatePinterestCopy({ product, trend, angle });
    return {
      id: uid("content_pin"),
      productId: product.id,
      trendId: trend?.id,
      angleId: angle?.id,
      platform,
      type: "pin",
      title: String(body.pinTitle),
      body,
      status: "queued",
      disclosureLine: String(body.disclosureLine),
      cta: String(body.cta),
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      createdAt: now,
    } satisfies ContentItem;
  }

  if (platform === "tiktok") {
    const body = await provider.generateTikTokCopy({ product, trend, angle });
    return {
      id: uid("content_tt"),
      productId: product.id,
      trendId: trend?.id,
      angleId: angle?.id,
      platform,
      type: "tiktok_script",
      title: String(body.hook),
      body,
      status: "queued",
      disclosureLine: String(body.disclosureLine),
      cta: String(body.cta),
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(),
      createdAt: now,
    } satisfies ContentItem;
  }

  const body = await provider.generateLandingCopy({ product, trend, angle });
  return {
    id: uid("content_web"),
    productId: product.id,
    trendId: trend?.id,
    angleId: angle?.id,
    platform,
    type: "product_page",
    title: String(body.headline),
    body,
    status: "published",
    disclosureLine: String(body.disclosureLine),
    cta: "View tracked offer",
    publishedAt: now,
    createdAt: now,
  } satisfies ContentItem;
}

export async function generateContentBatch(state: CommerceState, limit = 6) {
  const topProducts = [...state.products].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, limit);
  const existingKeys = new Set(state.content.map((item) => `${item.productId}:${item.platform}`));
  const generated: ContentItem[] = [];

  for (const product of topProducts) {
    for (const platform of ["pinterest", "tiktok", "web"] as const) {
      if (!existingKeys.has(`${product.id}:${platform}`)) {
        generated.push(await generateContentForProduct(state, product, platform));
      }
    }
  }

  return generated;
}
