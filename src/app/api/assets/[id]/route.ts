import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { readState } from "@/lib/state/demo-state";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const state = await readState();
  const asset = state.assets.find((item) => item.id === id);

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const rasterPath = typeof asset.spec.rasterPath === "string" ? asset.spec.rasterPath : undefined;
  if (rasterPath) {
    const filePath = path.join(process.cwd(), "storage", rasterPath);
    const body = await fs.readFile(filePath);
    return new NextResponse(body, {
      headers: {
        "content-type": typeof asset.spec.contentType === "string" ? asset.spec.contentType : "image/png",
        "cache-control": "public, max-age=3600",
      },
    });
  }

  return new NextResponse(asset.svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
