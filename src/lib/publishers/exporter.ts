import { promises as fs } from "fs";
import path from "path";
import type { Asset, ContentItem, Product } from "@/lib/domain";

export async function exportPostPackage(content: ContentItem, product: Product, assets: Asset[]) {
  const exportDir = path.join(process.cwd(), "exports", content.platform);
  await fs.mkdir(exportDir, { recursive: true });

  const exportPath = path.join(exportDir, `${content.id}.json`);
  await fs.writeFile(
    exportPath,
    JSON.stringify(
      {
        content,
        product,
        assets: assets.filter((asset) => asset.productId === product.id),
        disclosure: content.disclosureLine,
      },
      null,
      2,
    ),
  );

  return exportPath;
}
