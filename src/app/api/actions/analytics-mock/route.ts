import { NextResponse } from "next/server";
import { createMockMetrics } from "@/lib/engine/analytics";
import { addLog, mutateState } from "@/lib/state/demo-state";

export async function POST() {
  const state = await mutateState((draft) => {
    const metrics = createMockMetrics(draft);
    draft.metrics.unshift(...metrics);
    addLog(draft, "info", "analytics", "Imported mock dashboard metrics.", { metrics: metrics.length });
    return draft;
  });

  return NextResponse.json({ ok: true, metrics: state.metrics.length });
}
