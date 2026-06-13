import { AppShell } from "@/components/operator/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function AnglesPage() {
  const state = await readState();

  return (
    <AppShell state={state} title="Viral Angles">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.angles.map((angle) => (
          <Panel key={angle.id}>
            <PanelHeader title={angle.hookType} kicker={angle.platform} />
            <PanelBody>
              <div className="grid gap-3 text-sm">
                <p><span className="font-black">Visual:</span> {angle.visualStyle}</p>
                <p><span className="font-black">Pain:</span> {angle.painPoint}</p>
                <p><span className="font-black">Audience:</span> {angle.audience}</p>
                <p><span className="font-black">Emotion:</span> {angle.emotionalAngle}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone="blue">{angle.niche}</Badge>
                <Badge tone="amber">{angle.productCategory}</Badge>
              </div>
            </PanelBody>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
