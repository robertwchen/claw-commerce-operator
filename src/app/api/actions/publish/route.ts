import { NextResponse } from "next/server";
import { exportPostPackage } from "@/lib/publishers/exporter";
import { activePublishingMode, publishQueue } from "@/lib/publishers/real";
import { addLog, mutateState } from "@/lib/state/demo-state";

export async function POST() {
  const state = await mutateState(async (draft) => {
    const logs = await publishQueue(draft);
    for (const log of logs) {
      const content = draft.content.find((item) => item.id === log.contentId);
      const product = draft.products.find((item) => item.id === content?.productId);
      if (content && product) {
        content.exportPath = await exportPostPackage(content, product, draft.assets);
      }
    }
    draft.publishLogs.unshift(...logs);
    addLog(draft, "info", "publisher", "Published queued dashboard content.", { mode: activePublishingMode(), published: logs.length });
    return draft;
  });

  return NextResponse.json({ ok: true, published: state.publishLogs.length });
}
