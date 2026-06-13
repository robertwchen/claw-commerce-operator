import Link from "next/link";
import { AppShell } from "@/components/operator/app-shell";
import { ProductImage } from "@/components/operator/product-image";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function LandingPagesPage() {
  const state = await readState();

  return (
    <AppShell state={state} title="Landing Pages">
      <Panel>
        <PanelHeader title="Published Web Pages" />
        <PanelBody>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {state.landingPages.map((page) => {
              const product = state.products.find((item) => item.id === page.productId)!;
              return (
                <Link key={page.id} href={page.publicUrl} className="rounded-lg border border-[#ebe6d8] bg-[#fdfbf6] p-3 hover:bg-white">
                  <ProductImage product={product} />
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-black">{page.title}</h2>
                      <p className="mt-1 text-xs font-semibold text-[#7c7467]">{page.publicUrl}</p>
                    </div>
                    <Badge tone={page.type === "product" ? "green" : page.type === "guide" ? "blue" : "amber"}>{page.type}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </PanelBody>
      </Panel>
    </AppShell>
  );
}
