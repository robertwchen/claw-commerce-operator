import Link from "next/link";
import { AppShell } from "@/components/operator/app-shell";
import { ProductImage } from "@/components/operator/product-image";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { readState } from "@/lib/state/demo-state";
import { currency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const state = await readState();
  const products = [...state.products].sort((a, b) => b.opportunityScore - a.opportunityScore);

  return (
    <AppShell state={state} title="Products">
      <Panel>
        <PanelHeader title="Product Hunter" />
        <PanelBody className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-[#7c7467]">
              <tr>
                <th className="py-3">Product</th>
                <th>Source</th>
                <th>Niche</th>
                <th>Price</th>
                <th>Commission</th>
                <th>Trend</th>
                <th>Opportunity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe6d8]">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-3">
                    <Link href={`/p/${product.slug}`} className="flex items-center gap-3">
                      <ProductImage product={product} className="h-16 w-20" />
                      <div>
                        <p className="font-black capitalize">{product.title}</p>
                        <p className="text-xs font-semibold text-[#7c7467]">{product.brand} · {product.category}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="font-semibold">{product.source}</td>
                  <td className="font-semibold">{product.niche}</td>
                  <td className="font-bold">{currency(product.price)}</td>
                  <td className="font-bold">{currency(product.commissionEstimate)}</td>
                  <td><Badge tone="blue">{product.trendScore}</Badge></td>
                  <td><Badge tone="green">{product.opportunityScore}</Badge></td>
                  <td><Badge tone={product.status === "winner" ? "amber" : "neutral"}>{product.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelBody>
      </Panel>
    </AppShell>
  );
}
