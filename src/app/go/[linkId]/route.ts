import { NextRequest, NextResponse } from "next/server";
import { recordAffiliateClick } from "@/lib/engine/tracking";
import { addLog, mutateState } from "@/lib/state/demo-state";

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
    recordAffiliateClick(draft, link.code, {
      sourcePlatform: request.nextUrl.searchParams.get("source") ?? "web",
      campaign: request.nextUrl.searchParams.get("campaign") ?? link.campaign,
      referrer: request.headers.get("referer") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return draft;
  });

  return NextResponse.redirect(destination);
}
