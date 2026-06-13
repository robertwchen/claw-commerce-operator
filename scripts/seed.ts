import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedAngles, seedProducts, seedTrends } from "@/lib/data/seed";
import { scoreProduct } from "@/lib/engine/scoring";
import { createInitialState, writeState } from "@/lib/state/demo-state";

async function seedPrisma() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL is not set; skipped Prisma/Postgres seed and wrote demo JSON state.");
    return;
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const product of seedProducts.map(scoreProduct)) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: product,
        create: product,
      });
    }

    for (const trend of seedTrends) {
      await prisma.trend.upsert({
        where: { slug: trend.slug },
        update: {
          keyword: trend.keyword,
          niche: trend.niche,
          platform: trend.platform,
          velocity: trend.velocity,
          confidence: trend.confidence,
          exampleHooks: trend.exampleHooks,
          matchingSlugs: trend.matchingProducts,
          status: trend.status,
        },
        create: {
          id: trend.id,
          slug: trend.slug,
          keyword: trend.keyword,
          niche: trend.niche,
          platform: trend.platform,
          velocity: trend.velocity,
          confidence: trend.confidence,
          exampleHooks: trend.exampleHooks,
          matchingSlugs: trend.matchingProducts,
          status: trend.status,
        },
      });
    }

    for (const angle of seedAngles) {
      await prisma.viralAngle.upsert({
        where: { slug: angle.slug },
        update: angle,
        create: angle,
      });
    }

    console.log("Seeded Prisma/Postgres catalog.");
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await writeState(createInitialState());
  await seedPrisma();
  console.log("Demo state seeded in storage/demo-state.json.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
