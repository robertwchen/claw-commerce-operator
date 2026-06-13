import { AppShell } from "@/components/operator/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const state = await readState();
  const env = [
    ["OPERATOR_MODE", process.env.OPERATOR_MODE === "real"],
    ["NEXT_PUBLIC_APP_URL", Boolean(process.env.NEXT_PUBLIC_APP_URL)],
    ["PRODUCT_CATALOG_JSON", Boolean(process.env.PRODUCT_CATALOG_JSON)],
    ["TREND_FEED_JSON", Boolean(process.env.TREND_FEED_JSON)],
    ["ANALYTICS_IMPORT_JSON", Boolean(process.env.ANALYTICS_IMPORT_JSON)],
    ["DATABASE_URL", Boolean(process.env.DATABASE_URL)],
    ["REDIS_URL", Boolean(process.env.REDIS_URL)],
    ["OPENAI_API_KEY", Boolean(process.env.OPENAI_API_KEY)],
    ["ANTHROPIC_API_KEY", Boolean(process.env.ANTHROPIC_API_KEY)],
    ["PINTEREST_ACCESS_TOKEN", Boolean(process.env.PINTEREST_ACCESS_TOKEN)],
    ["PINTEREST_BOARD_ID", Boolean(process.env.PINTEREST_BOARD_ID)],
    ["TIKTOK_ACCESS_TOKEN", Boolean(process.env.TIKTOK_ACCESS_TOKEN)],
    ["TIKTOK_PHOTO_URLS", Boolean(process.env.TIKTOK_PHOTO_URLS)],
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
              ["Real Mode", !state.settings.demoMode],
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
                <Badge tone={present ? "green" : "neutral"}>{present ? "set" : "missing"}</Badge>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </AppShell>
  );
}
