import { describe, expect, it } from "vitest";
import { calculateOpportunityScore, rankProducts, scoreProduct } from "@/lib/engine/scoring";
import { seedProducts } from "@/lib/data/seed";

describe("opportunity scoring", () => {
  it("uses the requested scoring formula", () => {
    expect(
      calculateOpportunityScore({
        trendScore: 10,
        visualScore: 20,
        buyerIntent: 30,
        commissionValue: 40,
        priceValue: 50,
        competitionPenalty: 15,
      }),
    ).toBe(135);
  });

  it("scores and ranks seeded products", () => {
    const scored = scoreProduct(seedProducts[0]);
    expect(scored.status).toBe("scored");
    expect(scored.opportunityScore).toBeGreaterThan(0);

    const ranked = rankProducts(seedProducts);
    expect(ranked[0].opportunityScore).toBeGreaterThanOrEqual(ranked[1].opportunityScore);
  });
});
