import type { Product } from "@/lib/domain";

export function calculateOpportunityScore(product: Pick<Product, "trendScore" | "visualScore" | "buyerIntent" | "commissionValue" | "priceValue" | "competitionPenalty">) {
  return Math.max(
    0,
    Math.round(
      product.trendScore +
        product.visualScore +
        product.buyerIntent +
        product.commissionValue +
        product.priceValue -
        product.competitionPenalty,
    ),
  );
}

export function scoreProduct(product: Product): Product {
  return {
    ...product,
    opportunityScore: calculateOpportunityScore(product),
    status: product.status === "new" ? "scored" : product.status,
  };
}

export function rankProducts(products: Product[]) {
  return [...products].map(scoreProduct).sort((a, b) => b.opportunityScore - a.opportunityScore);
}
