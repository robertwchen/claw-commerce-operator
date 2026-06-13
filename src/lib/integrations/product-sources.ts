import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Product } from "@/lib/domain";
import { slugify, uid } from "@/lib/utils";

type RawProduct = Record<string, unknown>;

function numberValue(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : fallback;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function productFromRaw(row: RawProduct, index: number): Product {
  const title = stringValue(row.title ?? row.name, `Product ${index + 1}`);
  const slug = slugify(stringValue(row.slug, title));
  const price = numberValue(row.price ?? row.currentPrice, 0);
  const commissionRate = numberValue(row.commissionRate, numberValue(process.env.DEFAULT_COMMISSION_RATE, 0.04));
  const commissionEstimate = numberValue(row.commissionEstimate, Number((price * commissionRate).toFixed(2)));

  return {
    id: stringValue(row.id, `prod_${slug || uid("product")}`),
    slug,
    title,
    brand: stringValue(row.brand, "Unknown brand"),
    category: stringValue(row.category, "Uncategorized"),
    price,
    commissionEstimate,
    productUrl: stringValue(row.productUrl ?? row.url, ""),
    affiliateUrl: stringValue(row.affiliateUrl ?? row.trackingUrl ?? row.productUrl ?? row.url, ""),
    imageUrl: stringValue(row.imageUrl ?? row.image, ""),
    rating: numberValue(row.rating, 0),
    reviewCount: Math.round(numberValue(row.reviewCount ?? row.reviews, 0)),
    source: stringValue(row.source, "owned catalog import"),
    niche: stringValue(row.niche, stringValue(row.category, "general commerce").toLowerCase()),
    trendScore: numberValue(row.trendScore, 50),
    visualScore: numberValue(row.visualScore, 50),
    buyerIntent: numberValue(row.buyerIntent, 50),
    commissionValue: numberValue(row.commissionValue, Math.min(100, Math.round(commissionEstimate * 10))),
    priceValue: numberValue(row.priceValue, price ? Math.max(10, 100 - Math.round(price)) : 50),
    competitionPenalty: numberValue(row.competitionPenalty, 20),
    opportunityScore: numberValue(row.opportunityScore, 0),
    status: "new",
  };
}

async function readJsonSource(source: string) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Catalog source ${source} returned ${response.status}.`);
    return response.json();
  }

  const absolutePath = path.isAbsolute(source) ? source : path.join(/*turbopackIgnore: true*/ process.cwd(), source);
  return JSON.parse(await fs.readFile(absolutePath, "utf8")) as unknown;
}

export async function loadOwnedCatalogProducts(source = process.env.PRODUCT_CATALOG_JSON) {
  if (!source) return [];
  const payload = await readJsonSource(source);
  const rows = Array.isArray(payload) ? payload : Array.isArray((payload as { products?: unknown }).products) ? (payload as { products: unknown[] }).products : [];
  return rows.map((row, index) => productFromRaw(row as RawProduct, index)).filter((product) => product.title && product.affiliateUrl);
}

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function hmac(key: crypto.BinaryLike, value: string) {
  return crypto.createHmac("sha256", key).update(value, "utf8").digest();
}

function hmacHex(key: crypto.BinaryLike, value: string) {
  return crypto.createHmac("sha256", key).update(value, "utf8").digest("hex");
}

function amazonDate(date = new Date()) {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  };
}

function amazonAuthHeaders(payload: string, target: string, host: string, region: string, accessKey: string, secretKey: string) {
  const { amzDate, dateStamp } = amazonDate();
  const service = "ProductAdvertisingAPI";
  const canonicalHeaders = `content-encoding:amz-1.0\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:${target}\n`;
  const signedHeaders = "content-encoding;host;x-amz-date;x-amz-target";
  const canonicalRequest = ["POST", "/paapi5/searchitems", "", canonicalHeaders, signedHeaders, sha256Hex(payload)].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, dateStamp), region), service), "aws4_request");
  const signature = hmacHex(signingKey, stringToSign);

  return {
    "content-encoding": "amz-1.0",
    "x-amz-date": amzDate,
    "x-amz-target": target,
    authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

function amazonProductFromItem(item: Record<string, unknown>, index: number): Product {
  const itemInfo = item.ItemInfo as Record<string, unknown> | undefined;
  const title = stringValue((itemInfo?.Title as { DisplayValue?: unknown } | undefined)?.DisplayValue, `Amazon item ${index + 1}`);
  const byline = itemInfo?.ByLineInfo as Record<string, unknown> | undefined;
  const brand = stringValue((byline?.Brand as { DisplayValue?: unknown } | undefined)?.DisplayValue, "Amazon");
  const offers = item.OffersV2 as Record<string, unknown> | undefined;
  const listings = Array.isArray(offers?.Listings) ? offers.Listings : [];
  const firstListing = listings[0] as Record<string, unknown> | undefined;
  const price = numberValue((firstListing?.Price as { Amount?: unknown } | undefined)?.Amount, 0);
  const image = item.Images as Record<string, unknown> | undefined;
  const primary = image?.Primary as Record<string, unknown> | undefined;
  const large = primary?.Large as Record<string, unknown> | undefined;
  const detailPageUrl = stringValue(item.DetailPageURL, "");
  const slug = slugify(title);
  const commissionRate = numberValue(process.env.AMAZON_DEFAULT_COMMISSION_RATE, 0.04);

  return {
    id: `prod_${slug}`,
    slug,
    title,
    brand,
    category: stringValue(process.env.AMAZON_DEFAULT_CATEGORY, "Amazon product"),
    price,
    commissionEstimate: Number((price * commissionRate).toFixed(2)),
    productUrl: detailPageUrl,
    affiliateUrl: detailPageUrl,
    imageUrl: stringValue(large?.URL, ""),
    rating: 0,
    reviewCount: 0,
    source: "Amazon PA-API",
    niche: stringValue(process.env.AMAZON_DEFAULT_NICHE, "amazon commerce"),
    trendScore: 50,
    visualScore: 60,
    buyerIntent: 65,
    commissionValue: Math.min(100, Math.round(price * commissionRate * 10)),
    priceValue: price ? Math.max(10, 100 - Math.round(price)) : 50,
    competitionPenalty: 25,
    opportunityScore: 0,
    status: "new",
  };
}

export async function loadAmazonPaApiProducts() {
  if (process.env.AMAZON_PAAPI_ENABLED !== "true") return [];
  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const partnerTag = process.env.AMAZON_ASSOCIATE_TAG;
  if (!accessKey || !secretKey || !partnerTag) {
    throw new Error("Amazon PA-API requires AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, and AMAZON_ASSOCIATE_TAG.");
  }

  const host = process.env.AMAZON_PAAPI_HOST ?? "webservices.amazon.com";
  const region = process.env.AMAZON_PAAPI_REGION ?? "us-east-1";
  const target = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems";
  const keywords = process.env.AMAZON_SEARCH_KEYWORDS ?? "home organization";
  const payload = JSON.stringify({
    Keywords: keywords,
    SearchIndex: process.env.AMAZON_SEARCH_INDEX ?? "All",
    ItemCount: Math.min(10, Math.max(1, numberValue(process.env.AMAZON_ITEM_COUNT, 10))),
    PartnerTag: partnerTag,
    PartnerType: process.env.AMAZON_PARTNER_TYPE ?? "Associates",
    Marketplace: process.env.AMAZON_MARKETPLACE ?? "www.amazon.com",
    Resources: ["Images.Primary.Large", "ItemInfo.Title", "ItemInfo.ByLineInfo", "OffersV2.Listings.Price"],
  });

  const response = await fetch(`https://${host}/paapi5/searchitems`, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
      host,
      ...amazonAuthHeaders(payload, target, host, region, accessKey, secretKey),
    },
    body: payload,
  });
  const body = (await response.json().catch(async () => ({ raw: await response.text() }))) as Record<string, unknown>;
  if (!response.ok) throw new Error(`Amazon PA-API ${response.status}: ${JSON.stringify(body)}`);

  const items = ((body.SearchResult as { Items?: unknown } | undefined)?.Items ?? []) as unknown[];
  return items.map((item, index) => amazonProductFromItem(item as Record<string, unknown>, index)).filter((product) => product.title && product.affiliateUrl);
}

export async function loadRealProducts() {
  const [catalogProducts, amazonProducts] = await Promise.all([loadOwnedCatalogProducts(), loadAmazonPaApiProducts()]);
  const bySlug = new Map<string, Product>();
  for (const product of [...catalogProducts, ...amazonProducts]) bySlug.set(product.slug, product);
  return [...bySlug.values()];
}
