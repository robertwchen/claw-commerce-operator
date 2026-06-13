import { generateContentBatch } from "@/lib/engine/content";
import { addLog, mutateState } from "@/lib/state/demo-state";

async function main() {
  const state = await mutateState(async (draft) => {
    const generated = await generateContentBatch(draft, 5);
    draft.content.unshift(...generated);
    addLog(draft, "info", "content", "Generated original Pinterest, TikTok, and landing-page content.", { generated: generated.length });
    return draft;
  });

  console.log(`Content items available: ${state.content.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
