import { describe, expect, it } from "vitest";
import { runAutopilot } from "@/lib/engine/autopilot";
import { createInitialState } from "@/lib/state/demo-state";

describe("autopilot", () => {
  it("runs end-to-end in full demo mode", async () => {
    const state = createInitialState();
    const result = await runAutopilot(state, "full_autopilot");

    expect(result.run.status).toBe("completed");
    expect(result.state.content.length).toBeGreaterThan(0);
    expect(result.state.assets.length).toBeGreaterThan(0);
    expect(result.state.publishLogs.length).toBeGreaterThan(0);
    expect(result.state.metrics.length).toBeGreaterThan(0);
    expect(result.run.summary.winners).toBeInstanceOf(Array);
  });

  it("dry run records a run without mutating content inventory", async () => {
    const state = createInitialState();
    const result = await runAutopilot(state, "dry_run");

    expect(result.run.status).toBe("dry_run");
    expect(result.state.content).toHaveLength(0);
    expect(result.state.assets).toHaveLength(0);
  });
});
