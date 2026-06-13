import { AppShell } from "@/components/operator/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const state = await readState();
  const env = [
    ["DATABASE_URL", Boolean(process.env.DATABASE_URL)],
    ["REDIS_URL", Boolean(process.env.REDIS_URL)],
    ["OPENAI_API_KEY", Boolean(process.env.OPENAI_API_KEY)],
    ["ANTHROPIC_API_KEY", Boolean(process.env.ANTHROPIC_API_KEY)],
    ["PINTEREST_ACCESS_TOKEN", Boolean(process.env.PINTEREST_ACCESS_TOKEN)],
    ["TIKTOK_ACCESS_TOKEN", Boolean(process.env.TIKTOK_ACCESS_TOKEN)],
  ];

  return (
    <AppShell state={state} title="Settings">
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Platform Toggles" />
          <PanelBody className="grid gap-3">
            {[
              ["Pinterest", state.settings.pinterestEnabled],
              ["TikTok", state.settings.tiktokEnabled],
              ["Web", state.settings.webEnabled],
              ["Demo Mode", state.settings.demoMode],
            ].map(([label, enabled]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-lg border border-[#ebe6d8] px-4 py-3">
                <span className="font-bold">{label}</span>
                <Badge tone={enabled ? "green" : "amber"}>{enabled ? "enabled" : "disabled"}</Badge>
              </div>
            ))}
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Credentials" />
          <PanelBody className="grid gap-3">
            {env.map(([key, present]) => (
              <div key={String(key)} className="flex items-center justify-between rounded-lg border border-[#ebe6d8] px-4 py-3">
                <span className="font-mono text-sm font-bold">{key}</span>
                <Badge tone={present ? "green" : "neutral"}>{present ? "set" : "mock"}</Badge>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </AppShell>
  );
}
