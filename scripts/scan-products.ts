import { scoreProduct } from "@/lib/engine/scoring";
import { addLog, mutateState } from "@/lib/state/demo-state";

async function main() {
  const state = await mutateState((draft) => {
    draft.products = draft.products.map(scoreProduct);
    addLog(draft, "info", "products", "Scanned and rescored mock product sources.", { products: draft.products.length });
    return draft;
  });

  console.log(`Scored ${state.products.length} products. Top product: ${state.products.sort((a, b) => b.opportunityScore - a.opportunityScore)[0]?.title}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
