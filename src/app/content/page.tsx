import { FilePlus2 } from "lucide-react";
import { ActionButton } from "@/components/operator/action-button";
import { AppShell } from "@/components/operator/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const state = await readState();

  return (
    <AppShell state={state} title="Content Generator">
      <Panel>
        <PanelHeader title="Generated Content" action={<ActionButton endpoint="/api/actions/generate-content" variant="accent"><FilePlus2 className="h-4 w-4" />Generate variants</ActionButton>} />
        <PanelBody className="grid gap-4">
          {state.content.map((content) => {
            const product = state.products.find((item) => item.id === content.productId);
            return (
              <article key={content.id} className="rounded-lg border border-[#ebe6d8] bg-[#fdfbf6] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">{content.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-[#7c7467]">{product?.title} · {content.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone={content.platform === "tiktok" ? "red" : content.platform === "pinterest" ? "amber" : "blue"}>{content.platform}</Badge>
                    <Badge tone="green">{content.status}</Badge>
                  </div>
                </div>
                <pre className="mt-4 max-h-56 overflow-auto rounded-lg bg-white p-4 text-xs leading-6 text-[#514d43]">{JSON.stringify(content.body, null, 2)}</pre>
                <p className="mt-3 text-xs font-bold text-[#7c7467]">{content.disclosureLine}</p>
              </article>
            );
          })}
        </PanelBody>
      </Panel>
    </AppShell>
  );
}
