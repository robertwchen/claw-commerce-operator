import { addLog, mutateState } from "@/lib/state/demo-state";

async function main() {
  const state = await mutateState((draft) => {
    draft.trends = draft.trends.map((trend, index) => ({
      ...trend,
      velocity: Math.min(100, trend.velocity + (index % 3) + 1),
      confidence: Math.min(100, trend.confidence + (index % 2)),
      status: trend.velocity > 82 ? "rising" : trend.status,
    }));
    addLog(draft, "info", "trends", "Scanned mock TikTok, Pinterest, Google Trends, and Reddit trend feeds.", { trends: draft.trends.length });
    return draft;
  });

  console.log(`Updated ${state.trends.length} trend signals.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
