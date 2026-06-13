import type { CommerceState, ContentPlatform, MetricImport } from "@/lib/domain";
import { nowIso, uid } from "@/lib/utils";

export function createMockMetrics(state: CommerceState) {
  return state.content.slice(0, 12).map((content, index) => {
    const product = state.products.find((item) => item.id === content.productId);
    const base = Math.max(300, Math.round((product?.opportunityScore ?? 150) * (2.5 + index * 0.3)));
    const clicks = Math.max(4, Math.round(base * (0.025 + (index % 4) * 0.006)));
    const conversions = Math.max(0, Math.floor(clicks * (0.07 + (index % 3) * 0.02)));

    return {
      id: uid("metric"),
      contentId: content.id,
      productId: content.productId,
      platform: content.platform,
      impressions: base,
      saves: Math.round(base * 0.035),
      likes: Math.round(base * 0.05),
      clicks,
      conversions,
      revenue: Number((conversions * (product?.commissionEstimate ?? 4)).toFixed(2)),
      importedAt: nowIso(),
    } satisfies MetricImport;
  });
}

export function summarizeAnalytics(state: CommerceState) {
  const totals = state.metrics.reduce(
    (acc, metric) => {
      acc.impressions += metric.impressions;
      acc.clicks += metric.clicks;
      acc.conversions += metric.conversions;
      acc.revenue += metric.revenue;
      acc.likes += metric.likes;
      acc.saves += metric.saves;
      return acc;
    },
    { impressions: 0, clicks: 0, conversions: 0, revenue: 0, likes: 0, saves: 0 },
  );

  const clickCount = state.clickEvents.length;
  const ctr = totals.impressions ? (totals.clicks + clickCount) / totals.impressions : 0;
  const platforms: Record<ContentPlatform, number> = { pinterest: 0, tiktok: 0, web: 0 };
  const products = new Map<string, number>();

  for (const metric of state.metrics) {
    platforms[metric.platform] += metric.revenue;
    if (metric.productId) products.set(metric.productId, (products.get(metric.productId) ?? 0) + metric.revenue + metric.clicks);
  }

  const topProducts = [...products.entries()]
    .map(([productId, score]) => ({
      product: state.products.find((product) => product.id === productId),
      score,
    }))
    .filter((item) => item.product)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    ...totals,
    trackedClicks: clickCount,
    ctr,
    platformRevenue: platforms,
    topProducts,
    topNiches: Object.entries(
      state.products.reduce<Record<string, number>>((acc, product) => {
        acc[product.niche] = (acc[product.niche] ?? 0) + product.opportunityScore;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    topHooks: state.angles.slice(0, 5).map((angle) => angle.hookType),
  };
}
