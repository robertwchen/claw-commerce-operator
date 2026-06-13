import { AppShell } from "@/components/operator/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  const state = await readState();

  return (
    <AppShell state={state} title="Trends">
      <div className="grid gap-4 xl:grid-cols-2">
        {state.trends.map((trend) => (
          <Panel key={trend.id}>
            <PanelHeader title={trend.keyword} kicker={trend.platform} />
            <PanelBody>
              <div className="flex flex-wrap gap-2">
                <Badge tone="green">velocity {trend.velocity}</Badge>
                <Badge tone="blue">confidence {trend.confidence}</Badge>
                <Badge tone="amber">{trend.status}</Badge>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {trend.exampleHooks.map((hook) => <div key={hook} className="rounded-lg bg-[#fdfbf6] p-4 text-sm font-bold">{hook}</div>)}
              </div>
              <p className="mt-5 text-sm font-semibold text-[#7c7467]">{trend.matchingProducts.length} matching products · {trend.niche}</p>
            </PanelBody>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
