import { promises as fs } from "fs";
import path from "path";
import type { ContentPlatform, MetricImport } from "@/lib/domain";
import { nowIso, uid } from "@/lib/utils";

type RawMetric = Record<string, unknown>;

function numberValue(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

async function readJsonSource(source: string) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Metric source ${source} returned ${response.status}.`);
    return response.json();
  }

  const absolutePath = path.isAbsolute(source) ? source : path.join(/*turbopackIgnore: true*/ process.cwd(), source);
  return JSON.parse(await fs.readFile(absolutePath, "utf8")) as unknown;
}

function metricFromRaw(row: RawMetric): MetricImport {
  return {
    id: stringValue(row.id, uid("metric")),
    contentId: optionalString(row.contentId),
    productId: optionalString(row.productId),
    platform: stringValue(row.platform, "web") as ContentPlatform,
    impressions: Math.round(numberValue(row.impressions)),
    saves: Math.round(numberValue(row.saves)),
    likes: Math.round(numberValue(row.likes)),
    clicks: Math.round(numberValue(row.clicks)),
    conversions: Math.round(numberValue(row.conversions)),
    revenue: numberValue(row.revenue),
    importedAt: stringValue(row.importedAt, nowIso()),
  };
}

export async function loadRealMetrics(source = process.env.ANALYTICS_IMPORT_JSON) {
  if (!source) return [];
  const payload = await readJsonSource(source);
  const rows = Array.isArray(payload) ? payload : Array.isArray((payload as { metrics?: unknown }).metrics) ? (payload as { metrics: unknown[] }).metrics : [];
  return rows.map((row) => metricFromRaw(row as RawMetric));
}
