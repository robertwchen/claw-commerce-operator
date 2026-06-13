import type { Product } from "@/lib/domain";
import Image from "next/image";

export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  return <Image src={product.imageUrl} alt={product.title} width={900} height={675} unoptimized className={`aspect-[4/3] w-full rounded-lg border border-[#d9d2c2] bg-[#fdfbf6] object-cover ${className}`} />;
}
