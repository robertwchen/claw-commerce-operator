import { BarChart3 } from "lucide-react";
import { ActionButton } from "@/components/operator/action-button";
import { AppShell } from "@/components/operator/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { summarizeAnalytics } from "@/lib/engine/analytics";
import { readState } from "@/lib/state/demo-state";
import { compactNumber, currency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const state = await readState();
  const analytics = summarizeAnalytics(state);

  return (
    <AppShell state={state} title="Analytics">
      <Panel>
        <PanelHeader title="Performance" action={<ActionButton endpoint="/api/actions/analytics-mock" variant="accent"><BarChart3 className="h-4 w-4" />Import metrics</ActionButton>} />
        <PanelBody>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-[#fdfbf6] p-4"><p className="text-xs font-bold uppercase text-[#7c7467]">Impressions</p><p className="mt-2 text-3xl font-black">{compactNumber(analytics.impressions)}</p></div>
            <div className="rounded-lg bg-[#fdfbf6] p-4"><p className="text-xs font-bold uppercase text-[#7c7467]">CTR</p><p className="mt-2 text-3xl font-black">{(analytics.ctr * 100).toFixed(1)}%</p></div>
            <div className="rounded-lg bg-[#fdfbf6] p-4"><p className="text-xs font-bold uppercase text-[#7c7467]">Conversions</p><p className="mt-2 text-3xl font-black">{analytics.conversions}</p></div>
            <div className="rounded-lg bg-[#fdfbf6] p-4"><p className="text-xs font-bold uppercase text-[#7c7467]">Revenue</p><p className="mt-2 text-3xl font-black">{currency(analytics.revenue)}</p></div>
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div>
              <h2 className="text-base font-black">Top Products</h2>
              <div className="mt-3 grid gap-2">
                {analytics.topProducts.map((item) => item.product ? <div key={item.product.id} className="flex items-center justify-between rounded-lg border border-[#ebe6d8] px-4 py-3"><span className="font-bold capitalize">{item.product.title}</span><Badge tone="green">{Math.round(item.score)}</Badge></div> : null)}
              </div>
            </div>
            <div>
              <h2 className="text-base font-black">Top Niches</h2>
              <div className="mt-3 grid gap-2">
                {analytics.topNiches.map(([niche, score]) => <div key={niche} className="flex items-center justify-between rounded-lg border border-[#ebe6d8] px-4 py-3"><span className="font-bold">{niche}</span><Badge tone="blue">{Math.round(score)}</Badge></div>)}
              </div>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </AppShell>
  );
}
