import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { ActionButton } from "@/components/operator/action-button";
import { AppShell } from "@/components/operator/app-shell";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const state = await readState();

  return (
    <AppShell state={state} title="Asset Preview">
      <Panel>
        <PanelHeader title="Generated Assets" action={<ActionButton endpoint="/api/actions/generate-assets" variant="accent"><ImagePlus className="h-4 w-4" />Generate assets</ActionButton>} />
        <PanelBody>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {state.assets.map((asset) => {
              const product = state.products.find((item) => item.id === asset.productId);
              return (
                <article key={asset.id} className="rounded-lg border border-[#ebe6d8] bg-[#fdfbf6] p-3">
                  <Image src={asset.url} alt={asset.title} width={1200} height={900} unoptimized className="aspect-[4/3] w-full rounded-lg border border-[#d9d2c2] bg-white object-cover" />
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-black capitalize">{asset.type.replace(/_/g, " ")}</h2>
                      <p className="text-xs font-semibold text-[#7c7467]">{product?.title}</p>
                    </div>
                    <Badge tone="green">{asset.status}</Badge>
                  </div>
                </article>
              );
            })}
          </div>
        </PanelBody>
      </Panel>
    </AppShell>
  );
}
