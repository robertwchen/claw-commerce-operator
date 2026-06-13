import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { AffiliateLink, LandingPage, Product } from "@/lib/domain";
import { buttonClassName } from "@/components/ui/button";
import { ProductImage } from "@/components/operator/product-image";

export function PublicLandingPage({ page, product, link }: { page: LandingPage; product: Product; link: AffiliateLink }) {
  const alternatives = page.body.alternatives.length ? page.body.alternatives : ["drawer dividers", "closet organizer", "bathroom storage rack"];

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#262521]">
      <section className="mx-auto grid min-h-[88vh] max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <Link href="/" className="text-sm font-bold uppercase tracking-[0.12em] text-[#7c7467]">Claw Commerce Operator</Link>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">{page.title}</h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-[#514d43]">{page.body.summary}</p>
          <p className="mt-5 max-w-2xl rounded-lg border border-[#d9d2c2] bg-white px-4 py-3 text-sm font-semibold text-[#514d43]">
            Disclosure: this page may contain affiliate links. As an Amazon Associate I earn from qualifying purchases when Amazon links are used.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/go/${link.code}?source=web&campaign=${link.campaign}`} className={buttonClassName({ variant: "accent" })}>
              View tracked offer
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link href={`/compare/${product.slug}`} className={buttonClassName({ variant: "secondary" })}>Compare options</Link>
          </div>
        </div>
        <ProductImage product={product} className="min-h-[360px]" />
      </section>
      <section className="border-t border-[#d9d2c2] bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-lg font-black">Pros</h2>
            <ul className="mt-4 grid gap-3">
              {page.body.pros.map((item) => <li key={item} className="rounded-lg bg-[#e2f1eb] px-4 py-3 text-sm font-semibold text-[#235744]">{item}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-black">Cons</h2>
            <ul className="mt-4 grid gap-3">
              {page.body.cons.map((item) => <li key={item} className="rounded-lg bg-[#f8dfda] px-4 py-3 text-sm font-semibold text-[#843d33]">{item}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-black">Alternatives</h2>
            <ul className="mt-4 grid gap-3">
              {alternatives.map((item) => <li key={item} className="rounded-lg bg-[#fbf0cc] px-4 py-3 text-sm font-semibold text-[#6e5417]">{item}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
