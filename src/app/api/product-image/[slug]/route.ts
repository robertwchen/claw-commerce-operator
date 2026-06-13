import { NextResponse } from "next/server";
import { seedProducts } from "@/lib/data/seed";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const product = seedProducts.find((item) => item.slug === slug) ?? seedProducts[0];
  const title = escapeXml(product.title);
  const niche = escapeXml(product.niche);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="675" viewBox="0 0 900 675" role="img">
    <rect width="900" height="675" fill="#fdfbf6"/>
    <rect x="58" y="58" width="784" height="559" rx="42" fill="#ffffff" stroke="#262521" stroke-width="6"/>
    <rect x="128" y="142" width="644" height="260" rx="38" fill="#a7d8c9"/>
    <circle cx="298" cy="270" r="92" fill="#e8b84e"/>
    <rect x="398" y="205" width="230" height="130" rx="26" fill="#ef8f7a"/>
    <path d="M190 478h520M250 535h400" stroke="#262521" stroke-width="24" stroke-linecap="round" opacity=".18"/>
    <text x="450" y="484" text-anchor="middle" font-family="Inter, Arial" font-size="54" font-weight="800" fill="#262521">${title}</text>
    <text x="450" y="544" text-anchor="middle" font-family="Inter, Arial" font-size="30" font-weight="700" fill="#514d43">${niche}</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
