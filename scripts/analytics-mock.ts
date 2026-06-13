import { createMockMetrics } from "@/lib/engine/analytics";
import { addLog, mutateState } from "@/lib/state/demo-state";

async function main() {
  const state = await mutateState((draft) => {
    const metrics = createMockMetrics(draft);
    draft.metrics.unshift(...metrics);
    addLog(draft, "info", "analytics", "Imported mock impressions, saves, clicks, conversions, and revenue.", { imports: metrics.length });
    return draft;
  });

  const revenue = state.metrics.reduce((sum, metric) => sum + metric.revenue, 0);
  console.log(`Metric imports: ${state.metrics.length}. Revenue estimate: $${revenue.toFixed(2)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
