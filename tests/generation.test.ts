import { describe, expect, it } from "vitest";
import { buildAssetSvg, generateAssetsForProduct } from "@/lib/engine/assets";
import { generateContentForProduct } from "@/lib/engine/content";
import { createInitialState } from "@/lib/state/demo-state";

describe("content and asset generation", () => {
  it("generates platform-specific original content with disclosure", async () => {
    const state = createInitialState();
    const product = state.products[0];

    const pin = await generateContentForProduct(state, product, "pinterest");
    const tiktok = await generateContentForProduct(state, product, "tiktok");

    expect(pin.platform).toBe("pinterest");
    expect(pin.disclosureLine.toLowerCase()).toContain("affiliate");
    expect(tiktok.platform).toBe("tiktok");
    expect(String(tiktok.body.caption).toLowerCase()).toContain("disclosure");
  });

  it("generates all requested simple asset types", () => {
    const state = createInitialState();
    const assets = generateAssetsForProduct(state, state.products[0]);

    expect(assets.map((asset) => asset.type).sort()).toEqual(
      ["before_after", "comparison_graphic", "pinterest_card", "product_collage", "tiktok_storyboard"].sort(),
    );
    expect(assets[0].svg).toContain("<svg");
  });

  it("generates parseable storyboard SVG and escapes product text", () => {
    const state = createInitialState();
    const product = { ...state.products[0], title: "Rack & Rail <Plus>", niche: "kitchen & pantry" };
    const svg = buildAssetSvg("tiktok_storyboard", product);

    expect(svg).not.toContain("/></text>");
    expect(svg).toContain("Rack &amp; Rail &lt;Plus&gt;");
  });
});
