import { BarChart3, MousePointerClick, PackageSearch, Radar } from "lucide-react";
import Link from "next/link";
import { ActionButton } from "@/components/operator/action-button";
import { AppShell } from "@/components/operator/app-shell";
import { MetricCard } from "@/components/operator/metric-card";
import { ProductImage } from "@/components/operator/product-image";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { summarizeAnalytics } from "@/lib/engine/analytics";
import { readState } from "@/lib/state/demo-state";
import { compactNumber, currency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await readState();
  const analytics = summarizeAnalytics(state);
  const topProducts = [...state.products].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 5);
  const pipeline = [
    ["Products", state.products.length, "scored catalog"],
    ["Trends", state.trends.length, "active feeds"],
    ["Content", state.content.length, "generated posts"],
    ["Assets", state.assets.length, "visual packages"],
    ["Published", state.content.filter((item) => item.status === "mock_published" || item.status === "published").length, "mock/live posts"],
  ];

  return (
    <AppShell state={state} title="Overview">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={PackageSearch} label="Products found" value={String(state.products.length)} detail={`${topProducts[0]?.title ?? "No products"} leads`} tone="green" />
        <MetricCard icon={Radar} label="Trends found" value={String(state.trends.length)} detail={`${state.trends.filter((trend) => trend.status === "rising").length} rising signals`} tone="blue" />
        <MetricCard icon={MousePointerClick} label="Clicks" value={compactNumber(analytics.trackedClicks + analytics.clicks)} detail={`${(analytics.ctr * 100).toFixed(1)}% CTR estimate`} tone="amber" />
        <MetricCard icon={BarChart3} label="Revenue estimate" value={currency(analytics.revenue)} detail={`${analytics.conversions} mock conversions`} tone="red" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <PanelHeader
            title="Operator Pipeline"
            action={
              <div className="flex flex-wrap gap-2">
                <ActionButton endpoint="/api/actions/generate-content" variant="secondary">Generate content</ActionButton>
                <ActionButton endpoint="/api/actions/autopilot" variant="accent">Run autopilot</ActionButton>
              </div>
            }
          />
          <PanelBody>
            <div className="grid gap-3 md:grid-cols-5">
              {pipeline.map(([label, value, detail]) => (
                <div key={label} className="rounded-lg border border-[#ebe6d8] bg-[#fdfbf6] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#7c7467]">{label}</p>
                  <p className="mt-2 text-3xl font-black">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-[#7c7467]">{detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3">
              {state.logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-4 rounded-lg border border-[#ebe6d8] px-4 py-3">
                  <div>
                    <p className="text-sm font-bold">{log.message}</p>
                    <p className="text-xs font-semibold text-[#7c7467]">{log.scope} · {new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge tone={log.level === "error" ? "red" : log.level === "warn" ? "amber" : "green"}>{log.level}</Badge>
                </div>
              ))}
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Top Opportunities" action={<Link href="/products" className="text-sm font-bold text-[#2f7d68]">View all</Link>} />
          <PanelBody>
            <div className="grid gap-4">
              {topProducts.map((product) => (
                <Link key={product.id} href={`/p/${product.slug}`} className="grid grid-cols-[92px_1fr_auto] items-center gap-4 rounded-lg border border-[#ebe6d8] p-3 hover:bg-[#fdfbf6]">
                  <ProductImage product={product} />
                  <div>
                    <p className="font-black capitalize">{product.title}</p>
                    <p className="text-sm font-semibold text-[#7c7467]">{product.niche}</p>
                  </div>
                  <Badge tone="green">{product.opportunityScore}</Badge>
                </Link>
              ))}
            </div>
          </PanelBody>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel>
          <PanelHeader title="Content Queue" />
          <PanelBody className="grid gap-3">
            {state.content.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-lg border border-[#ebe6d8] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="line-clamp-1 text-sm font-bold">{item.title}</p>
                  <Badge tone={item.platform === "tiktok" ? "red" : item.platform === "pinterest" ? "amber" : "blue"}>{item.platform}</Badge>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#7c7467]">{item.status}</p>
              </div>
            ))}
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Trend Signals" />
          <PanelBody className="grid gap-3">
            {state.trends.map((trend) => (
              <div key={trend.id} className="rounded-lg border border-[#ebe6d8] px-4 py-3">
                <p className="text-sm font-bold">{trend.keyword}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone="blue">{trend.platform}</Badge>
                  <Badge tone="green">{trend.velocity}</Badge>
                </div>
              </div>
            ))}
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Autopilot Runs" />
          <PanelBody className="grid gap-3">
            {state.autopilotRuns.slice(0, 6).map((run) => (
              <div key={run.id} className="rounded-lg border border-[#ebe6d8] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold">{run.mode}</p>
                  <Badge tone={run.status === "failed" ? "red" : "green"}>{run.status}</Badge>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#7c7467]">{new Date(run.startedAt).toLocaleString()}</p>
              </div>
            ))}
            {!state.autopilotRuns.length ? <div className="rounded-lg border border-[#ebe6d8] p-4 text-sm font-semibold text-[#7c7467]">No runs yet</div> : null}
          </PanelBody>
        </Panel>
      </div>
    </AppShell>
  );
}
