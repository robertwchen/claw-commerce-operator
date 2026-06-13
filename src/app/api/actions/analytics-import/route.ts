import { NextResponse } from "next/server";
import { createMockMetrics } from "@/lib/engine/analytics";
import { loadRealMetrics } from "@/lib/integrations/metric-sources";
import { isRealMode } from "@/lib/runtime";
import { addLog, mutateState } from "@/lib/state/demo-state";

export async function POST() {
  const state = await mutateState(async (draft) => {
    const realMetrics = await loadRealMetrics();
    const metrics = realMetrics.length ? realMetrics : isRealMode() ? [] : createMockMetrics(draft);
    draft.metrics.unshift(...metrics);
    addLog(
      draft,
      realMetrics.length || !isRealMode() ? "info" : "error",
      "analytics",
      realMetrics.length ? "Imported real dashboard metrics." : isRealMode() ? "No real analytics source configured. Set ANALYTICS_IMPORT_JSON." : "Imported demo dashboard metrics.",
      { metrics: metrics.length },
    );
    return draft;
  });

  return NextResponse.json({ ok: true, metrics: state.metrics.length });
}
