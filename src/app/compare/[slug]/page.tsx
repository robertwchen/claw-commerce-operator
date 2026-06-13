import { notFound } from "next/navigation";
import { PublicLandingPage } from "@/components/operator/landing-page";
import { readState } from "@/lib/state/demo-state";

export const dynamic = "force-dynamic";

export default async function CompareLanding({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const state = await readState();
  const page = state.landingPages.find((item) => item.type === "compare" && item.slug === slug);
  const product = state.products.find((item) => item.id === page?.productId);
  const link = state.affiliateLinks.find((item) => item.productId === product?.id);

  if (!page || !product || !link) notFound();

  return <PublicLandingPage page={page} product={product} link={link} />;
}
