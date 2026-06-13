import type { AutopilotMode } from "@/lib/domain";
import { runAutopilot } from "@/lib/engine/autopilot";
import { mutateState } from "@/lib/state/demo-state";

const mode = (process.argv[2] ?? "dry_run") as AutopilotMode;

async function main() {
  const state = await mutateState(async (draft) => {
    const result = await runAutopilot(draft, mode);
    return result.state;
  });

  const latest = state.autopilotRuns[0];
  console.log(`${latest.mode} autopilot ${latest.status}: ${JSON.stringify(latest.summary)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
