import { scoreProduct } from "@/lib/engine/scoring";
import { loadRealProducts } from "@/lib/integrations/product-sources";
import { isRealMode } from "@/lib/runtime";
import { addLog, mutateState, syncCommerceDerivedState } from "@/lib/state/demo-state";

async function main() {
  const state = await mutateState(async (draft) => {
    const products = await loadRealProducts();

    if (products.length) {
      draft.products = products.map(scoreProduct);
      syncCommerceDerivedState(draft);
      addLog(draft, "info", "products", "Imported and scored real product catalog sources.", {
        products: draft.products.length,
        sources: [...new Set(draft.products.map((product) => product.source))],
      });
      return draft;
    }

    if (isRealMode()) {
      addLog(draft, "error", "products", "No real product source configured. Set PRODUCT_CATALOG_JSON or Amazon API credentials.", {});
      return draft;
    }

    draft.products = draft.products.map(scoreProduct);
    addLog(draft, "info", "products", "Scanned and rescored demo product sources.", { products: draft.products.length });
    return draft;
  });

  const topProduct = state.products.sort((a, b) => b.opportunityScore - a.opportunityScore)[0]?.title;
  console.log(topProduct ? `Scored ${state.products.length} products. Top product: ${topProduct}` : "No products available after scan.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
