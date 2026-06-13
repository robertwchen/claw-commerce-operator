import { generateAssetBatch } from "@/lib/engine/assets";
import { addLog, mutateState } from "@/lib/state/demo-state";

async function main() {
  const state = await mutateState((draft) => {
    const generated = generateAssetBatch(draft, 6);
    draft.assets.unshift(...generated);
    addLog(draft, "info", "assets", "Generated simple visual assets for top products.", { generated: generated.length });
    return draft;
  });

  console.log(`Assets available: ${state.assets.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
