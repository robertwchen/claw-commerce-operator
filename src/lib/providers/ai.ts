import type { Product, Trend, ViralAngle } from "@/lib/domain";
import { isRealMode, MissingCredentialError } from "@/lib/runtime";

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

const systemPrompt = [
  "You generate original affiliate commerce copy for owned accounts and owned web properties.",
  "Never copy creator captions or scripts. Use trends only as abstract direction.",
  "Include a clear affiliate disclosure in every generated object.",
  "Treat product and performance claims as draft copy unless backed by the provided product data.",
  "Return only valid JSON matching the requested schema.",
].join(" ");

const copySchemas = {
  pinterest: {
    type: "object",
    additionalProperties: false,
    required: ["pinTitle", "description", "boardName", "imageLayoutSpec", "keywords", "cta", "disclosureLine"],
    properties: {
      pinTitle: { type: "string" },
      description: { type: "string" },
      boardName: { type: "string" },
      imageLayoutSpec: { type: "string" },
      keywords: { type: "array", items: { type: "string" } },
      cta: { type: "string" },
      disclosureLine: { type: "string" },
    },
  },
  tiktok: {
    type: "object",
    additionalProperties: false,
    required: ["hook", "script", "shotList", "voiceover", "caption", "hashtags", "cta", "disclosureLine"],
    properties: {
      hook: { type: "string" },
      script: { type: "array", items: { type: "string" } },
      shotList: { type: "array", items: { type: "string" } },
      voiceover: { type: "string" },
      caption: { type: "string" },
      hashtags: { type: "array", items: { type: "string" } },
      cta: { type: "string" },
      disclosureLine: { type: "string" },
    },
  },
  landing: {
    type: "object",
    additionalProperties: false,
    required: ["headline", "summary", "pros", "cons", "alternatives", "disclosureLine"],
    properties: {
      headline: { type: "string" },
      summary: { type: "string" },
      pros: { type: "array", items: { type: "string" } },
      cons: { type: "array", items: { type: "string" } },
      alternatives: { type: "array", items: { type: "string" } },
      disclosureLine: { type: "string" },
    },
  },
} as const;

function contextFor({ product, trend, angle }: GeneratedCopyInput) {
  return JSON.stringify(
    {
      product: {
        title: product.title,
        brand: product.brand,
        category: product.category,
        price: product.price,
        commissionEstimate: product.commissionEstimate,
        rating: product.rating,
        reviewCount: product.reviewCount,
        niche: product.niche,
        source: product.source,
      },
      trend: trend
        ? {
            keyword: trend.keyword,
            niche: trend.niche,
            platform: trend.platform,
            velocity: trend.velocity,
            confidence: trend.confidence,
            exampleHooks: trend.exampleHooks,
          }
        : undefined,
      angle: angle
        ? {
            hookType: angle.hookType,
            visualStyle: angle.visualStyle,
            painPoint: angle.painPoint,
            audience: angle.audience,
            emotionalAngle: angle.emotionalAngle,
            ctaStyle: angle.ctaStyle,
          }
        : undefined,
    },
    null,
    2,
  );
}

function parseJsonPayload(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  const jsonText = start >= 0 && end >= start ? trimmed.slice(start, end + 1) : trimmed;
  return JSON.parse(jsonText) as Record<string, unknown>;
}

function extractOpenAIText(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : [];
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const maybeText = (part as { text?: unknown }).text;
      if (typeof maybeText === "string") return maybeText;
    }
  }
  throw new Error("OpenAI response did not include text output.");
}

function extractAnthropicText(response: Record<string, unknown>) {
  const content = Array.isArray(response.content) ? response.content : [];
  const firstText = content.find((part) => part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string");
  if (firstText) return (firstText as { text: string }).text;
  throw new Error("Anthropic response did not include text output.");
}

function userPrompt(kind: string, input: GeneratedCopyInput) {
  return `Generate ${kind} copy from this product context. Keep it original and commerce-compliant.\n\n${contextFor(input)}`;
}

export class OpenAIProvider implements AIProvider {
  name = "openai" as const;
  private apiKey: string;
  private model: string;

  constructor(apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL ?? "gpt-5.5") {
    if (!apiKey) throw new MissingCredentialError("OpenAI", ["OPENAI_API_KEY"]);
    this.apiKey = apiKey;
    this.model = model;
  }

  private async generate(schemaName: keyof typeof copySchemas, prompt: string) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        input: [
          { role: "developer", content: [{ type: "input_text", text: systemPrompt }] },
          { role: "user", content: [{ type: "input_text", text: prompt }] },
        ],
        max_output_tokens: 1200,
        text: {
          format: {
            type: "json_schema",
            name: `commerce_${schemaName}`,
            schema: copySchemas[schemaName],
            strict: true,
          },
        },
      }),
    });

    const payload = (await response.json().catch(async () => ({ error: await response.text() }))) as Record<string, unknown>;
    if (!response.ok) throw new Error(`OpenAI ${response.status}: ${JSON.stringify(payload)}`);
    return parseJsonPayload(extractOpenAIText(payload));
  }

  generatePinterestCopy(input: GeneratedCopyInput) {
    return this.generate("pinterest", userPrompt("Pinterest Pin", input));
  }

  generateTikTokCopy(input: GeneratedCopyInput) {
    return this.generate("tiktok", userPrompt("TikTok storyboard and caption", input));
  }

  generateLandingCopy(input: GeneratedCopyInput) {
    return this.generate("landing", userPrompt("owned landing page", input));
  }
}

export class AnthropicProvider implements AIProvider {
  name = "anthropic" as const;
  private apiKey: string;
  private model: string;

  constructor(apiKey = process.env.ANTHROPIC_API_KEY, model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6") {
    if (!apiKey) throw new MissingCredentialError("Anthropic", ["ANTHROPIC_API_KEY"]);
    this.apiKey = apiKey;
    this.model = model;
  }

  private async generate(schemaName: keyof typeof copySchemas, prompt: string) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
        output_config: {
          format: {
            type: "json_schema",
            name: `commerce_${schemaName}`,
            schema: copySchemas[schemaName],
          },
        },
      }),
    });

    const payload = (await response.json().catch(async () => ({ error: await response.text() }))) as Record<string, unknown>;
    if (!response.ok) throw new Error(`Anthropic ${response.status}: ${JSON.stringify(payload)}`);
    return parseJsonPayload(extractAnthropicText(payload));
  }

  generatePinterestCopy(input: GeneratedCopyInput) {
    return this.generate("pinterest", userPrompt("Pinterest Pin", input));
  }

  generateTikTokCopy(input: GeneratedCopyInput) {
    return this.generate("tiktok", userPrompt("TikTok storyboard and caption", input));
  }

  generateLandingCopy(input: GeneratedCopyInput) {
    return this.generate("landing", userPrompt("owned landing page", input));
  }
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
  const selected = process.env.AI_PROVIDER;
  if (selected === "openai" || (!selected && process.env.OPENAI_API_KEY)) return new OpenAIProvider();
  if (selected === "anthropic" || (!selected && process.env.ANTHROPIC_API_KEY)) return new AnthropicProvider();
  if (isRealMode()) throw new MissingCredentialError("AI generation", ["OPENAI_API_KEY or ANTHROPIC_API_KEY", "AI_PROVIDER"]);
  return new MockAIProvider();
}
