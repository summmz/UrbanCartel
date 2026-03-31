/**
 * Fix specific product images that are broken or showing wrong content.
 * Run with: npx tsx server/fix-specific-images.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, like } from "drizzle-orm";
import { products } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

// Product names mapped to correct, verified-working image URLs
const FIXES: Record<string, string> = {
  // User-reported broken images
  "Sacoche Shoulder Bag": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800",
  "Lounge Shorts": "https://images.unsplash.com/photo-1591195853828-11db59a44f43?auto=format&fit=crop&q=80&w=800",
  "Dad Hat": "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800",
  "Intarsia Logo Knit": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
  "Tech Gloves": "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800",
  "Athletic Shorts": "https://images.unsplash.com/photo-1562886877-aaaa5c17965a?auto=format&fit=crop&q=80&w=800",
  "Washed Black Pullover": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",

  // Wrong images shown (suit instead of bottoms — visible in screenshot)
  "Pleated Chino": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800",
  "Corduroy Wide Pants": "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800",
};

async function fixSpecificImages() {
  console.log("\n🔧  Fixing specific product images...\n");

  let fixed = 0;

  for (const [name, newUrl] of Object.entries(FIXES)) {
    const matching = await db
      .select({ id: products.id, name: products.name, imageUrl: products.imageUrl })
      .from(products)
      .where(eq(products.name, name));

    if (matching.length === 0) {
      console.log(`  ⚠️  Product not found: "${name}"`);
      continue;
    }

    for (const p of matching) {
      await db.update(products).set({ imageUrl: newUrl }).where(eq(products.id, p.id));
      console.log(`  ✅  [${p.id}] ${p.name} → image updated`);
      fixed++;
    }
  }

  console.log(`\n✨  Fixed ${fixed} product images.\n`);
  process.exit(0);
}

fixSpecificImages().catch((err) => {
  console.error("Fix failed:", err);
  process.exit(1);
});
