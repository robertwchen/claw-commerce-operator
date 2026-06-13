import { NextResponse } from "next/server";
import { readState } from "@/lib/state/demo-state";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const state = await readState();
  const asset = state.assets.find((item) => item.id === id);

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return new NextResponse(asset.svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
