import { NextResponse } from "next/server";
import { generateAssetBatch } from "@/lib/engine/assets";
import { addLog, mutateState } from "@/lib/state/demo-state";

export async function POST() {
  const state = await mutateState((draft) => {
    const generated = generateAssetBatch(draft, 6);
    draft.assets.unshift(...generated);
    addLog(draft, "info", "assets", "Generated visual assets from dashboard action.", { generated: generated.length });
    return draft;
  });

  return NextResponse.json({ ok: true, assets: state.assets.length });
}
