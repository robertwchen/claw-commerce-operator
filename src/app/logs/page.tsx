import { AppShell } from "@/components/operator/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const state = await readState();

  return (
    <AppShell state={state} title="Logs">
      <Panel>
        <PanelHeader title="Operator Logs" />
        <PanelBody className="grid gap-3">
          {state.logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-[#ebe6d8] bg-[#fdfbf6] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black">{log.message}</p>
                  <p className="text-xs font-semibold text-[#7c7467]">{log.scope} · {new Date(log.createdAt).toLocaleString()}</p>
                </div>
                <Badge tone={log.level === "error" ? "red" : log.level === "warn" ? "amber" : "green"}>{log.level}</Badge>
              </div>
              <pre className="mt-3 overflow-auto rounded-lg bg-white p-3 text-xs leading-6">{JSON.stringify(log.metadata, null, 2)}</pre>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </AppShell>
  );
}
