import type { CommerceState } from "@/lib/domain";
import { addLog } from "@/lib/state/demo-state";
import { nowIso, uid } from "@/lib/utils";

export function recordAffiliateClick(
  state: CommerceState,
  linkCode: string,
  details: {
    sourcePlatform?: string;
    campaign?: string;
    referrer?: string;
    userAgent?: string;
  } = {},
) {
  const link = state.affiliateLinks.find((item) => item.code === linkCode || item.id === linkCode);
  if (!link) {
    addLog(state, "warn", "tracking", "Unknown affiliate link clicked.", { linkCode });
    return undefined;
  }

  link.clicks += 1;
  link.revenueEstimate = Number((link.revenueEstimate + 0.42).toFixed(2));

  const event = {
    id: uid("click"),
    linkId: link.id,
    productId: link.productId,
    sourcePlatform: details.sourcePlatform ?? "web",
    campaign: details.campaign ?? link.campaign,
    referrer: details.referrer,
    userAgent: details.userAgent,
    createdAt: nowIso(),
  };

  state.clickEvents.unshift(event);
  addLog(state, "info", "tracking", "Tracked outbound affiliate click.", { linkId: link.code, source: event.sourcePlatform });
  return { link, event };
}
