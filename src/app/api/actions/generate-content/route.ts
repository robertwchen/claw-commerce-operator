import { NextResponse } from "next/server";
import { generateContentBatch } from "@/lib/engine/content";
import { addLog, mutateState } from "@/lib/state/demo-state";

export async function POST() {
  const state = await mutateState(async (draft) => {
    const generated = await generateContentBatch(draft, 4, true);
    draft.content.unshift(...generated);
    addLog(draft, "info", "content", "Generated original content variants from dashboard action.", { generated: generated.length });
    return draft;
  });

  return NextResponse.json({ ok: true, content: state.content.length });
}
