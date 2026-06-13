import { createMockMetrics } from "@/lib/engine/analytics";
import { loadRealMetrics } from "@/lib/integrations/metric-sources";
import { isRealMode } from "@/lib/runtime";
import { addLog, mutateState } from "@/lib/state/demo-state";

async function main() {
  const state = await mutateState(async (draft) => {
    const realMetrics = await loadRealMetrics();
    const metrics = realMetrics.length ? realMetrics : isRealMode() ? [] : createMockMetrics(draft);
    draft.metrics.unshift(...metrics);
    addLog(
      draft,
      realMetrics.length || !isRealMode() ? "info" : "error",
      "analytics",
      realMetrics.length ? "Imported real analytics metrics." : isRealMode() ? "No real analytics source configured. Set ANALYTICS_IMPORT_JSON." : "Imported demo analytics metrics.",
      { imports: metrics.length },
    );
    return draft;
  });

  const revenue = state.metrics.reduce((sum, metric) => sum + metric.revenue, 0);
  console.log(`Metric imports: ${state.metrics.length}. Revenue estimate: $${revenue.toFixed(2)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
