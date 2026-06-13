import { Bot, Gauge } from "lucide-react";
import { ActionButton } from "@/components/operator/action-button";
import { AppShell } from "@/components/operator/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function AutopilotPage() {
  const state = await readState();

  return (
    <AppShell state={state} title="Autopilot">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <PanelHeader title="Run Mode" />
          <PanelBody className="grid gap-3">
            <ActionButton endpoint="/api/actions/autopilot?mode=dry_run" variant="secondary"><Gauge className="h-4 w-4" />Dry run</ActionButton>
            <ActionButton endpoint="/api/actions/autopilot?mode=manual_review" variant="secondary"><Bot className="h-4 w-4" />Manual review</ActionButton>
            <ActionButton endpoint="/api/actions/autopilot?mode=full_autopilot" variant="accent"><Bot className="h-4 w-4" />Full autopilot</ActionButton>
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Runs" />
          <PanelBody className="grid gap-3">
            {state.autopilotRuns.map((run) => (
              <div key={run.id} className="rounded-lg border border-[#ebe6d8] bg-[#fdfbf6] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black">{run.mode}</p>
                    <p className="text-xs font-semibold text-[#7c7467]">{new Date(run.startedAt).toLocaleString()}</p>
                  </div>
                  <Badge tone={run.status === "failed" ? "red" : "green"}>{run.status}</Badge>
                </div>
                <pre className="mt-4 overflow-auto rounded-lg bg-white p-3 text-xs leading-6">{JSON.stringify(run.summary, null, 2)}</pre>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </AppShell>
  );
}
