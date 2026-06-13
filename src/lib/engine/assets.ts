import { promises as fs } from "fs";
import path from "path";
import type { Asset, CommerceState, ContentItem, Product } from "@/lib/domain";
import { escapeXml, nowIso, uid } from "@/lib/utils";
import { isRealMode, MissingCredentialError } from "@/lib/runtime";

const palette = {
  ink: "#252525",
  paper: "#fbfaf6",
  mint: "#a7d8c9",
  coral: "#ef8f7a",
  gold: "#e8b84e",
  blue: "#8db7d9",
};

function productShape(product: Product, x: number, y: number) {
  const label = escapeXml(product.title.split(" ").slice(0, 3).join(" "));
  return `
    <rect x="${x}" y="${y}" width="250" height="180" rx="18" fill="#ffffff" stroke="${palette.ink}" stroke-width="3"/>
    <rect x="${x + 24}" y="${y + 28}" width="202" height="84" rx="14" fill="${palette.mint}"/>
    <circle cx="${x + 76}" cy="${y + 70}" r="26" fill="${palette.gold}"/>
    <rect x="${x + 118}" y="${y + 48}" width="82" height="44" rx="10" fill="${palette.coral}"/>
    <text x="${x + 125}" y="${y + 142}" text-anchor="middle" font-family="Inter, Arial" font-size="22" font-weight="700" fill="${palette.ink}">${label}</text>
  `;
}

function shell(width: number, height: number, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
    <rect width="${width}" height="${height}" fill="${palette.paper}"/>
    ${body}
  </svg>`;
}

export function buildAssetSvg(type: Asset["type"], product: Product) {
  const title = escapeXml(product.title);
  const niche = escapeXml(product.niche);

  if (type === "pinterest_card") {
    return shell(
      1000,
      1500,
      `
      <rect x="70" y="80" width="860" height="1340" rx="42" fill="#ffffff" stroke="${palette.ink}" stroke-width="6"/>
      <text x="120" y="190" font-family="Inter, Arial" font-size="70" font-weight="800" fill="${palette.ink}">${title}</text>
      <text x="120" y="270" font-family="Inter, Arial" font-size="42" fill="${palette.ink}">${niche} fix under ${Math.round(product.price + 1)}</text>
      ${productShape(product, 355, 390)}
      <rect x="120" y="760" width="760" height="86" rx="24" fill="${palette.mint}"/>
      <text x="500" y="816" text-anchor="middle" font-family="Inter, Arial" font-size="34" font-weight="700" fill="${palette.ink}">Before vs after ready</text>
      <rect x="120" y="890" width="220" height="220" rx="24" fill="${palette.blue}"/>
      <rect x="390" y="890" width="220" height="220" rx="24" fill="${palette.gold}"/>
      <rect x="660" y="890" width="220" height="220" rx="24" fill="${palette.coral}"/>
      <text x="500" y="1280" text-anchor="middle" font-family="Inter, Arial" font-size="30" fill="${palette.ink}">Disclosure: affiliate link</text>
      `,
    );
  }

  if (type === "tiktok_storyboard") {
    return shell(
      1080,
      1920,
      `
      <text x="80" y="120" font-family="Inter, Arial" font-size="60" font-weight="800" fill="${palette.ink}">30s storyboard</text>
      ${[0, 1, 2, 3].map((row) => `<rect x="80" y="${190 + row * 390}" width="920" height="300" rx="34" fill="#ffffff" stroke="${palette.ink}" stroke-width="4"/><text x="130" y="${265 + row * 390}" font-family="Inter, Arial" font-size="40" font-weight="700" fill="${palette.ink}">${["Problem", "Place it", "Proof shots", "CTA + disclosure"][row]}</text><rect x="130" y="${310 + row * 390}" width="250" height="120" rx="20" fill="${[palette.coral, palette.gold, palette.mint, palette.blue][row]}"/>`).join("")}
      <text x="540" y="1810" text-anchor="middle" font-family="Inter, Arial" font-size="34" fill="${palette.ink}">${title}</text>
      `,
    );
  }

  if (type === "comparison_graphic") {
    return shell(
      1200,
      900,
      `
      <text x="70" y="110" font-family="Inter, Arial" font-size="58" font-weight="800" fill="${palette.ink}">Compare the fix</text>
      ${productShape(product, 80, 210)}
      <rect x="430" y="220" width="310" height="360" rx="26" fill="#ffffff" stroke="${palette.ink}" stroke-width="4"/>
      <text x="585" y="315" text-anchor="middle" font-family="Inter, Arial" font-size="34" font-weight="800" fill="${palette.ink}">Best for</text>
      <text x="585" y="375" text-anchor="middle" font-family="Inter, Arial" font-size="28" fill="${palette.ink}">${niche}</text>
      <rect x="810" y="220" width="310" height="360" rx="26" fill="${palette.mint}" stroke="${palette.ink}" stroke-width="4"/>
      <text x="965" y="315" text-anchor="middle" font-family="Inter, Arial" font-size="34" font-weight="800" fill="${palette.ink}">Watch</text>
      <text x="965" y="375" text-anchor="middle" font-family="Inter, Arial" font-size="28" fill="${palette.ink}">dimensions</text>
      `,
    );
  }

  if (type === "before_after") {
    return shell(
      1200,
      900,
      `
      <rect x="70" y="110" width="500" height="620" rx="34" fill="${palette.coral}"/>
      <rect x="630" y="110" width="500" height="620" rx="34" fill="${palette.mint}"/>
      <text x="320" y="210" text-anchor="middle" font-family="Inter, Arial" font-size="56" font-weight="800" fill="${palette.ink}">Before</text>
      <text x="880" y="210" text-anchor="middle" font-family="Inter, Arial" font-size="56" font-weight="800" fill="${palette.ink}">After</text>
      <path d="M170 390h300M200 470h240M150 550h320" stroke="${palette.ink}" stroke-width="18" stroke-linecap="round"/>
      ${productShape(product, 755, 365)}
      <text x="600" y="820" text-anchor="middle" font-family="Inter, Arial" font-size="34" fill="${palette.ink}">${title}</text>
      `,
    );
  }

  return shell(
    1400,
    900,
    `
    <text x="80" y="110" font-family="Inter, Arial" font-size="58" font-weight="800" fill="${palette.ink}">Product collage</text>
    ${productShape(product, 90, 220)}
    ${productShape(product, 420, 320)}
    ${productShape(product, 750, 220)}
    <rect x="1020" y="350" width="260" height="150" rx="24" fill="${palette.gold}"/>
    <text x="1150" y="440" text-anchor="middle" font-family="Inter, Arial" font-size="32" font-weight="800" fill="${palette.ink}">${niche}</text>
    `,
  );
}

export function generateAssetsForProduct(state: CommerceState, product: Product, content?: ContentItem) {
  const createdAt = nowIso();
  const types: Asset["type"][] = ["pinterest_card", "product_collage", "comparison_graphic", "before_after", "tiktok_storyboard"];

  return types.map((type) => {
    const id = uid(`asset_${type}`);
    return {
      id,
      productId: product.id,
      contentId: content?.id,
      type,
      title: `${product.title} ${type.replace(/_/g, " ")}`,
      url: `/api/assets/${id}`,
      spec: {
        product: product.title,
        palette,
        layout: type,
        disclosure: "Affiliate disclosure included where applicable.",
      },
      svg: buildAssetSvg(type, product),
      status: "generated",
      createdAt,
    } satisfies Asset;
  });
}

export function generateAssetBatch(state: CommerceState, limit = 4) {
  const existing = new Set(state.assets.map((asset) => `${asset.productId}:${asset.type}`));
  return [...state.products]
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, limit)
    .flatMap((product) => generateAssetsForProduct(state, product).filter((asset) => !existing.has(`${asset.productId}:${asset.type}`)));
}

function assetPrompt(type: Asset["type"], product: Product) {
  const purpose = type.replace(/_/g, " ");
  return [
    `Create an original affiliate commerce ${purpose} for ${product.title}.`,
    `Product context: brand ${product.brand}, category ${product.category}, niche ${product.niche}, price ${product.price}.`,
    "Use a clean editorial product-photography style with useful whitespace for social commerce.",
    "Do not include logos you do not own, creator likenesses, platform UI, or unverified performance claims.",
    "Include a small readable disclosure: Disclosure: affiliate link.",
  ].join(" ");
}

async function generateOpenAIImage(prompt: string) {
  if (!process.env.OPENAI_API_KEY) throw new MissingCredentialError("OpenAI image generation", ["OPENAI_API_KEY"]);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2",
      prompt,
      n: 1,
      size: process.env.OPENAI_IMAGE_SIZE ?? "1024x1536",
      quality: process.env.OPENAI_IMAGE_QUALITY ?? "medium",
      output_format: "png",
    }),
  });
  const payload = (await response.json().catch(async () => ({ raw: await response.text() }))) as Record<string, unknown>;
  if (!response.ok) throw new Error(`OpenAI image generation ${response.status}: ${JSON.stringify(payload)}`);
  const data = Array.isArray(payload.data) ? (payload.data[0] as { b64_json?: unknown } | undefined) : undefined;
  if (typeof data?.b64_json !== "string") throw new Error("OpenAI image generation did not return base64 image data.");
  return Buffer.from(data.b64_json, "base64");
}

async function generateRealAssetsForProduct(product: Product) {
  const createdAt = nowIso();
  const types: Asset["type"][] = ["pinterest_card", "product_collage", "comparison_graphic", "before_after", "tiktok_storyboard"];
  const outDir = path.join(process.cwd(), "storage", "generated-assets");
  await fs.mkdir(outDir, { recursive: true });

  const assets: Asset[] = [];
  for (const type of types) {
    const id = uid(`asset_${type}`);
    const relativePath = path.join("generated-assets", `${id}.png`);
    const filePath = path.join(process.cwd(), "storage", relativePath);
    const image = await generateOpenAIImage(assetPrompt(type, product));
    await fs.writeFile(filePath, image);
    assets.push({
      id,
      productId: product.id,
      type,
      title: `${product.title} ${type.replace(/_/g, " ")}`,
      url: `/api/assets/${id}`,
      spec: {
        product: product.title,
        provider: "openai",
        model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2",
        rasterPath: relativePath.replace(/\\/g, "/"),
        contentType: "image/png",
        disclosure: "Affiliate disclosure included in prompt.",
      },
      svg: "",
      status: "generated",
      createdAt,
    });
  }

  return assets;
}

export async function generateAssetBatchRealAware(state: CommerceState, limit = 4) {
  if (!isRealMode() && process.env.ASSET_PROVIDER !== "openai") return generateAssetBatch(state, limit);

  const existing = new Set(state.assets.map((asset) => `${asset.productId}:${asset.type}`));
  const products = [...state.products].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, limit);
  const generated: Asset[] = [];

  for (const product of products) {
    const assets = await generateRealAssetsForProduct(product);
    generated.push(...assets.filter((asset) => !existing.has(`${asset.productId}:${asset.type}`)));
  }

  return generated;
}
