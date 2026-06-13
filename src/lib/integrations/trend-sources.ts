import { promises as fs } from "fs";
import path from "path";
import type { Trend } from "@/lib/domain";
import { slugify, uid } from "@/lib/utils";

type RawTrend = Record<string, unknown>;

function numberValue(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

async function readJsonSource(source: string) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Trend source ${source} returned ${response.status}.`);
    return response.json();
  }

  const absolutePath = path.isAbsolute(source) ? source : path.join(/*turbopackIgnore: true*/ process.cwd(), source);
  return JSON.parse(await fs.readFile(absolutePath, "utf8")) as unknown;
}

function trendFromRaw(row: RawTrend, index: number): Trend {
  const keyword = stringValue(row.keyword ?? row.query ?? row.name, `trend ${index + 1}`);
  const platform = stringValue(row.platform, "Web") as Trend["platform"];

  return {
    id: stringValue(row.id, `trend_${slugify(keyword) || uid("trend")}`),
    slug: slugify(stringValue(row.slug, keyword)),
    keyword,
    niche: stringValue(row.niche ?? row.category, "general commerce"),
    platform,
    velocity: numberValue(row.velocity ?? row.score, 50),
    confidence: numberValue(row.confidence, 75),
    exampleHooks: stringArray(row.exampleHooks ?? row.hooks),
    matchingProducts: stringArray(row.matchingProducts ?? row.productSlugs),
    status: (stringValue(row.status, "manual") as Trend["status"]) || "manual",
  };
}

export async function loadRealTrends(source = process.env.TREND_FEED_JSON) {
  if (!source) return [];
  const payload = await readJsonSource(source);
  const rows = Array.isArray(payload) ? payload : Array.isArray((payload as { trends?: unknown }).trends) ? (payload as { trends: unknown[] }).trends : [];
  return rows.map((row, index) => trendFromRaw(row as RawTrend, index)).filter((trend) => trend.keyword);
}
