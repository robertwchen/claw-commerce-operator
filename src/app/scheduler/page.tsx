import { Send } from "lucide-react";
import { ActionButton } from "@/components/operator/action-button";
import { AppShell } from "@/components/operator/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function SchedulerPage() {
  const state = await readState();

  return (
    <AppShell state={state} title="Scheduler">
      <Panel>
        <PanelHeader title="Content Queue" action={<ActionButton endpoint="/api/actions/publish" variant="accent"><Send className="h-4 w-4" />Publish</ActionButton>} />
        <PanelBody className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-[#7c7467]">
              <tr>
                <th className="py-3">Title</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Scheduled</th>
                <th>Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe6d8]">
              {state.content.map((content) => (
                <tr key={content.id}>
                  <td className="py-3 font-bold">{content.title}</td>
                  <td><Badge tone={content.platform === "tiktok" ? "red" : content.platform === "pinterest" ? "amber" : "blue"}>{content.platform}</Badge></td>
                  <td><Badge tone={content.status.includes("published") ? "green" : "neutral"}>{content.status}</Badge></td>
                  <td className="font-semibold text-[#7c7467]">{content.scheduledFor ? new Date(content.scheduledFor).toLocaleString() : "ready"}</td>
                  <td className="font-semibold text-[#7c7467]">{content.exportPath ?? "pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelBody>
      </Panel>
    </AppShell>
  );
}
