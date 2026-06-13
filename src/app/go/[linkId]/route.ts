import { NextRequest, NextResponse } from "next/server";
import { addLog, mutateState } from "@/lib/state/demo-state";
import { nowIso, uid } from "@/lib/utils";

export async function GET(request: NextRequest, context: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await context.params;
  let destination = "https://example.com";

  await mutateState((draft) => {
    const link = draft.affiliateLinks.find((item) => item.code === linkId || item.id === linkId);
    if (!link) {
      addLog(draft, "warn", "tracking", "Unknown affiliate link clicked.", { linkId });
      return draft;
    }

    destination = link.destinationUrl;
    link.clicks += 1;
    link.revenueEstimate = Number((link.revenueEstimate + 0.42).toFixed(2));
    draft.clickEvents.unshift({
      id: uid("click"),
      linkId: link.id,
      productId: link.productId,
      sourcePlatform: request.nextUrl.searchParams.get("source") ?? "web",
      campaign: request.nextUrl.searchParams.get("campaign") ?? link.campaign,
      referrer: request.headers.get("referer") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
      createdAt: nowIso(),
    });
    addLog(draft, "info", "tracking", "Tracked outbound affiliate click.", { linkId: link.code, source: request.nextUrl.searchParams.get("source") ?? "web" });
    return draft;
  });

  return NextResponse.redirect(destination);
}
