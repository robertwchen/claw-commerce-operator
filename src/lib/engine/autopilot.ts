import type { AutopilotMode, AutopilotRun, CommerceState } from "@/lib/domain";
import { createMockMetrics } from "@/lib/engine/analytics";
import { generateAssetBatchRealAware } from "@/lib/engine/assets";
import { generateContentBatch } from "@/lib/engine/content";
import { scoreProduct } from "@/lib/engine/scoring";
import { loadRealMetrics } from "@/lib/integrations/metric-sources";
import { publishQueue } from "@/lib/publishers/real";
import { isRealMode } from "@/lib/runtime";
import { addLog } from "@/lib/state/demo-state";
import { nowIso, uid } from "@/lib/utils";

export async function runAutopilot(state: CommerceState, mode: AutopilotMode = "dry_run") {
  const startedAt = nowIso();
  const before = {
    content: state.content.length,
    assets: state.assets.length,
    metrics: state.metrics.length,
  };

  state.products = state.products.map(scoreProduct);
  addLog(state, "info", "autopilot", "Scored products with current trend and commerce signals.", { products: state.products.length });

  const generatedContent = await generateContentBatch(state, mode === "dry_run" ? 3 : 6);
  if (mode !== "dry_run") {
    state.content.unshift(...generatedContent);
  }

  const generatedAssets = await generateAssetBatchRealAware({ ...state, content: [...generatedContent, ...state.content] }, mode === "dry_run" ? 2 : 5);
  if (mode !== "dry_run") {
    state.assets.unshift(...generatedAssets);
  }

  const publishLogs = mode === "full_autopilot" ? await publishQueue(state) : [];
  if (mode === "full_autopilot") {
    state.publishLogs.unshift(...publishLogs);
  }

  const realMetrics = mode === "full_autopilot" ? await loadRealMetrics() : [];
  const metrics = mode === "full_autopilot" ? (realMetrics.length ? realMetrics : isRealMode() ? [] : createMockMetrics(state)) : [];
  if (mode === "full_autopilot") {
    state.metrics.unshift(...metrics);
  }

  const winners = state.products
    .filter((product) => product.opportunityScore > 285)
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 4);

  for (const product of winners) {
    product.status = "winner";
  }

  const run: AutopilotRun = {
    id: uid("run"),
    mode,
    status: mode === "dry_run" ? "dry_run" : "completed",
    startedAt,
    endedAt: nowIso(),
    summary: {
      before,
      generatedContent: generatedContent.length,
      generatedAssets: generatedAssets.length,
      publishLogs: publishLogs.length,
      metricsImported: metrics.length,
      winners: winners.map((product) => product.title),
    },
  };

  state.autopilotRuns.unshift(run);
  addLog(state, "info", "autopilot", `${mode} run finished.`, run.summary);
  return { state, run, generatedContent, generatedAssets, publishLogs, metrics };
}
