import type { Product, Trend, ViralAngle } from "@/lib/domain";

export type GeneratedCopyInput = {
  product: Product;
  trend?: Trend;
  angle?: ViralAngle;
};

export interface AIProvider {
  name: "mock" | "openai" | "anthropic";
  generatePinterestCopy(input: GeneratedCopyInput): Promise<Record<string, unknown>>;
  generateTikTokCopy(input: GeneratedCopyInput): Promise<Record<string, unknown>>;
  generateLandingCopy(input: GeneratedCopyInput): Promise<Record<string, unknown>>;
}

export class MockAIProvider implements AIProvider {
  name = "mock" as const;

  async generatePinterestCopy({ product, trend, angle }: GeneratedCopyInput) {
    const keyword = trend?.keyword ?? product.niche;
    return {
      pinTitle: `${product.title}: ${angle?.hookType ?? "small-space fix"}`,
      description: `A practical ${product.category.toLowerCase()} pick for ${keyword}. Clean setup, clear before-after use, and a simple path to compare options.`,
      boardName: `${product.niche} finds`,
      imageLayoutSpec: "Vertical 1000x1500 card with product hero, three benefit chips, and disclosure footer.",
      keywords: [keyword, product.category.toLowerCase(), product.niche, `${product.title} ideas`],
      cta: "See the setup",
      disclosureLine: "Disclosure: this post may contain affiliate links.",
    };
  }

  async generateTikTokCopy({ product, trend, angle }: GeneratedCopyInput) {
    const hook = `${angle?.hookType ?? "This solved it"}: ${product.title}`;
    return {
      hook,
      script: [
        `0-3s: Show the messy ${product.niche} problem and say, "${hook}."`,
        `4-10s: Show the product being placed in the exact problem area.`,
        `11-20s: Show three quick proof shots: fit, capacity, and final look.`,
        "21-27s: Call out who should skip it and who it is for.",
        "28-30s: Point to the comparison page and disclosure.",
      ],
      shotList: ["problem close-up", "installation or placement", "before/after reveal", "detail shot", "CTA frame"],
      voiceover: `I wanted a ${product.niche} fix that did not look complicated. This ${product.title} keeps the useful stuff visible and gets the clutter off the counter.`,
      caption: `${product.title} for ${trend?.keyword ?? product.niche}. Practical, not precious. Disclosure: affiliate link.`,
      hashtags: ["#ad", `#${product.niche.replace(/\s+/g, "")}`, "#homefinds", "#organization"],
      cta: "Open the comparison page",
      disclosureLine: "Disclosure: affiliate link / #ad.",
    };
  }

  async generateLandingCopy({ product }: GeneratedCopyInput) {
    return {
      headline: `${product.title} for ${product.niche}`,
      summary: `A focused buying page for ${product.title}, built around everyday pain points, quick proof, alternatives, and tracked affiliate clicks.`,
      pros: ["Solves a visible problem", "Easy to demonstrate", `Strong buyer intent in ${product.niche}`],
      cons: ["Check dimensions before buying", "Availability and price can change"],
      alternatives: ["budget pick", "premium pick", "space-saving pick"],
      disclosureLine: "Disclosure: this page may contain affiliate links. As an Amazon Associate I earn from qualifying purchases when Amazon links are used.",
    };
  }
}

export function getAIProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY) {
    return new MockAIProvider();
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return new MockAIProvider();
  }

  return new MockAIProvider();
}
