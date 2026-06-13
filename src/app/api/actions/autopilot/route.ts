import { NextRequest, NextResponse } from "next/server";
import type { AutopilotMode } from "@/lib/domain";
import { runAutopilot } from "@/lib/engine/autopilot";
import { mutateState } from "@/lib/state/demo-state";

export async function POST(request: NextRequest) {
  const mode = (request.nextUrl.searchParams.get("mode") ?? "full_autopilot") as AutopilotMode;
  const state = await mutateState(async (draft) => {
    const result = await runAutopilot(draft, mode);
    return result.state;
  });

  return NextResponse.json({ ok: true, latestRun: state.autopilotRuns[0] });
}
