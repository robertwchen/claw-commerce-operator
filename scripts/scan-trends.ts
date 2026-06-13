import { loadRealTrends } from "@/lib/integrations/trend-sources";
import { isRealMode } from "@/lib/runtime";
import { addLog, mutateState } from "@/lib/state/demo-state";

async function main() {
  const state = await mutateState(async (draft) => {
    const realTrends = await loadRealTrends();
    if (realTrends.length) {
      draft.trends = realTrends;
      addLog(draft, "info", "trends", "Imported real trend signals from configured export/API source.", { trends: draft.trends.length });
      return draft;
    }

    if (isRealMode()) {
      addLog(draft, "error", "trends", "No real trend source configured. Set TREND_FEED_JSON to an owned export or official API output.", {});
      return draft;
    }

    draft.trends = draft.trends.map((trend, index) => ({
      ...trend,
      velocity: Math.min(100, trend.velocity + (index % 3) + 1),
      confidence: Math.min(100, trend.confidence + (index % 2)),
      status: trend.velocity > 82 ? "rising" : trend.status,
    }));
    addLog(draft, "info", "trends", "Updated demo trend signals.", { trends: draft.trends.length });
    return draft;
  });

  console.log(state.trends.length ? `Updated ${state.trends.length} trend signals.` : "No trend signals available after scan.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
