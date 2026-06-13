import { promises as fs } from "fs";
import path from "path";
import type { AffiliateLink, CommerceState, LandingPage, OperatorLog, Product } from "@/lib/domain";
import { seedAngles, seedProducts, seedTrends } from "@/lib/data/seed";
import { scoreProduct } from "@/lib/engine/scoring";
import { isRealMode } from "@/lib/runtime";
import { nowIso, uid } from "@/lib/utils";

const storageDir = path.join(process.cwd(), "storage");
const statePath = path.join(storageDir, "demo-state.json");

function createAffiliateLinks(products: Product[] = seedProducts): AffiliateLink[] {
  return products.map((product) => ({
    id: `link_${product.slug}`,
    productId: product.id,
    code: product.slug,
    destinationUrl: product.affiliateUrl,
    campaign: `${product.slug}-launch`,
    clicks: 0,
    revenueEstimate: 0,
  }));
}

function createLandingPages(products: Product[] = seedProducts): LandingPage[] {
  const createdAt = nowIso();

  return products.flatMap((product) => [
    {
      id: `page_product_${product.slug}`,
      productId: product.id,
      type: "product",
      slug: product.slug,
      title: `${product.title} that makes ${product.niche} easier`,
      body: {
        summary: `A practical ${product.category.toLowerCase()} pick for people trying to fix ${product.niche} without a full remodel.`,
        pros: ["Easy to explain visually", "Clear everyday use case", "Strong price-to-problem fit"],
        cons: ["Demo results depend on the space", "Needs original product photos for paid campaigns"],
        alternatives: products.filter((item) => item.id !== product.id && item.niche === product.niche).slice(0, 3).map((item) => item.title),
      },
      status: "published",
      publicUrl: `/p/${product.slug}`,
      createdAt,
    },
    {
      id: `page_guide_${product.slug}`,
      productId: product.id,
      type: "guide",
      slug: product.slug,
      title: `Best ${product.category.toLowerCase()} ideas for ${product.niche}`,
      body: {
        summary: `A compact guide built around ${product.title}, related alternatives, and the buying triggers that make this niche convert.`,
        pros: ["Useful for Pinterest traffic", "Pairs with comparison content", "Keeps disclosure near buttons"],
        cons: ["Needs periodic price checks", "Should be refreshed when trend velocity drops"],
        alternatives: products.filter((item) => item.id !== product.id).slice(0, 3).map((item) => item.title),
      },
      status: "published",
      publicUrl: `/guides/${product.slug}`,
      createdAt,
    },
    {
      id: `page_compare_${product.slug}`,
      productId: product.id,
      type: "compare",
      slug: product.slug,
      title: `${product.title} compared with similar fixes`,
      body: {
        summary: `A buyer-intent page that compares ${product.title} with nearby options and routes clicks through tracked links.`,
        pros: ["Good for warm search traffic", "Highlights tradeoffs", "Works with multiple affiliate programs"],
        cons: ["Requires careful claims", "Comparison products should be kept current"],
        alternatives: products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3).map((item) => item.title),
      },
      status: "published",
      publicUrl: `/compare/${product.slug}`,
      createdAt,
    },
  ]);
}

export function createInitialState(): CommerceState {
  const now = nowIso();
  const scoredProducts = seedProducts.map(scoreProduct);
  const links = createAffiliateLinks();
  const logs: OperatorLog[] = [
    {
      id: uid("log"),
      level: "info",
      scope: "seed",
      message: "Demo catalog loaded with mock products, trends, and viral angles.",
      metadata: { products: scoredProducts.length, trends: seedTrends.length, angles: seedAngles.length },
      createdAt: now,
    },
  ];

  return {
    products: scoredProducts,
    trends: seedTrends,
    angles: seedAngles,
    content: [],
    assets: [],
    landingPages: createLandingPages(),
    affiliateLinks: links,
    clickEvents: [],
    metrics: [],
    publishLogs: [],
    autopilotRuns: [],
    logs,
    settings: {
      demoMode: true,
      pinterestEnabled: true,
      tiktokEnabled: true,
      webEnabled: true,
      aiProvider: "mock",
    },
    updatedAt: now,
  };
}

export function syncCommerceDerivedState(state: CommerceState) {
  const existingLinks = new Map(state.affiliateLinks.map((link) => [link.productId, link]));
  state.affiliateLinks = state.products.map((product) => {
    const existing = existingLinks.get(product.id);
    return {
      id: existing?.id ?? `link_${product.slug}`,
      productId: product.id,
      code: existing?.code ?? product.slug,
      destinationUrl: product.affiliateUrl,
      campaign: existing?.campaign ?? `${product.slug}-launch`,
      clicks: existing?.clicks ?? 0,
      revenueEstimate: existing?.revenueEstimate ?? 0,
    };
  });

  const existingPages = new Map(state.landingPages.map((page) => [`${page.type}:${page.productId}`, page]));
  state.landingPages = createLandingPages(state.products).map((page) => {
    const existing = existingPages.get(`${page.type}:${page.productId}`);
    return existing ? { ...page, id: existing.id, createdAt: existing.createdAt, status: existing.status } : page;
  });
}

export function createRealInitialState(): CommerceState {
  const now = nowIso();

  return {
    products: [],
    trends: [],
    angles: seedAngles,
    content: [],
    assets: [],
    landingPages: [],
    affiliateLinks: [],
    clickEvents: [],
    metrics: [],
    publishLogs: [],
    autopilotRuns: [],
    logs: [
      {
        id: uid("log"),
        level: "info",
        scope: "seed",
        message: "Real mode initialized. Configure PRODUCT_CATALOG_JSON, TREND_FEED_JSON, AI keys, and publisher credentials before running the operator loop.",
        metadata: {},
        createdAt: now,
      },
    ],
    settings: {
      demoMode: false,
      pinterestEnabled: true,
      tiktokEnabled: true,
      webEnabled: true,
      aiProvider: process.env.AI_PROVIDER === "anthropic" ? "anthropic" : process.env.AI_PROVIDER === "openai" ? "openai" : "mock",
    },
    updatedAt: now,
  };
}

async function ensureStorageDir() {
  await fs.mkdir(storageDir, { recursive: true });
}

export async function readState(): Promise<CommerceState> {
  await ensureStorageDir();

  try {
    const raw = await fs.readFile(statePath, "utf8");
    return JSON.parse(raw) as CommerceState;
  } catch {
    const state = isRealMode() ? createRealInitialState() : createInitialState();
    await writeState(state);
    return state;
  }
}

export async function writeState(state: CommerceState) {
  await ensureStorageDir();
  const nextState = { ...state, updatedAt: nowIso() };
  await fs.writeFile(statePath, JSON.stringify(nextState, null, 2));
  return nextState;
}

export async function mutateState(mutator: (state: CommerceState) => CommerceState | Promise<CommerceState>) {
  const state = await readState();
  const nextState = await mutator(state);
  return writeState(nextState);
}

export function addLog(state: CommerceState, level: OperatorLog["level"], scope: string, message: string, metadata: Record<string, unknown> = {}) {
  state.logs.unshift({
    id: uid("log"),
    level,
    scope,
    message,
    metadata,
    createdAt: nowIso(),
  });
}
