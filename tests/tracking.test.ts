import { describe, expect, it } from "vitest";
import { summarizeAnalytics } from "@/lib/engine/analytics";
import { recordAffiliateClick } from "@/lib/engine/tracking";
import { createInitialState } from "@/lib/state/demo-state";

describe("click tracking", () => {
  it("increments clicks and records click events", () => {
    const state = createInitialState();
    const link = state.affiliateLinks[0];

    const result = recordAffiliateClick(state, link.code, {
      sourcePlatform: "pinterest",
      campaign: "test-campaign",
      referrer: "https://pinterest.com/",
    });

    expect(result?.link.clicks).toBe(1);
    expect(state.clickEvents).toHaveLength(1);
    expect(state.clickEvents[0].sourcePlatform).toBe("pinterest");
    expect(state.clickEvents[0].campaign).toBe("test-campaign");
  });

  it("logs unknown link attempts without throwing", () => {
    const state = createInitialState();
    const result = recordAffiliateClick(state, "missing-link");

    expect(result).toBeUndefined();
    expect(state.logs[0].level).toBe("warn");
  });

  it("does not double-count tracked clicks in analytics", () => {
    const state = createInitialState();
    const link = state.affiliateLinks[0];
    recordAffiliateClick(state, link.code);

    const analytics = summarizeAnalytics(state);

    expect(link.clicks).toBe(1);
    expect(state.clickEvents).toHaveLength(1);
    expect(analytics.trackedClicks).toBe(1);
  });
});
