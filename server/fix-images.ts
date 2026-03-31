/**
 * Fix script — finds products with missing/null/empty imageUrl and assigns images.
 * Run with: npx tsx server/fix-images.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, isNull, or, sql } from "drizzle-orm";
import { products } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

// Fallback images per category
const CATEGORY_FALLBACK_IMAGES: Record<string, string[]> = {
  "Hoodies": [
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&q=80&w=800",
  ],
  "Tees": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=800",
  ],
  "Outerwear": [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800",
  ],
  "Accessories": [
    "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?auto=format&fit=crop&q=80&w=800",
  ],
  "Bottoms": [
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800",
  ],
  "Footwear": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
  ],
  "Headwear": [
    "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800",
  ],
  "Knitwear": [
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1434389677669-e08b4cda3007?auto=format&fit=crop&q=80&w=800",
  ],
  "Loungewear": [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
  ],
  "Bags": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
  ],
  "Jewelry": [
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
  ],
  "Swimwear": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1520942702018-0862200e6873?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
  ],
  "Sale": [
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
  ],
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800";

async function fixImages() {
  console.log("\n🔍  Scanning for products with missing images...\n");

  // Find products with null or empty imageUrl
  const missing = await db
    .select({ id: products.id, name: products.name, category: products.category, imageUrl: products.imageUrl })
    .from(products)
    .where(
      or(
        isNull(products.imageUrl),
        eq(products.imageUrl, ""),
      )
    );

  if (missing.length === 0) {
    console.log("  ✅  All products have image URLs!\n");
  } else {
    console.log(`  Found ${missing.length} products without images:\n`);

    for (let i = 0; i < missing.length; i++) {
      const p = missing[i];
      const categoryImages = CATEGORY_FALLBACK_IMAGES[p.category] || [DEFAULT_IMAGE];
      const imageUrl = categoryImages[i % categoryImages.length];

      await db
        .update(products)
        .set({ imageUrl })
        .where(eq(products.id, p.id));

      console.log(`  🖼️  Fixed: ${p.name} (${p.category}) → image assigned`);
    }
  }

  // Also list ALL products to show their image status
  const allProducts = await db
    .select({ id: products.id, name: products.name, category: products.category, imageUrl: products.imageUrl, isActive: products.isActive })
    .from(products)
    .where(eq(products.isActive, true));

  console.log(`\n📊  Total active products: ${allProducts.length}`);
  const withImages = allProducts.filter(p => p.imageUrl && p.imageUrl.length > 0);
  const withoutImages = allProducts.filter(p => !p.imageUrl || p.imageUrl.length === 0);
  console.log(`  ✅  With images: ${withImages.length}`);
  console.log(`  ❌  Without images: ${withoutImages.length}`);

  if (withoutImages.length > 0) {
    withoutImages.forEach(p => console.log(`     - [${p.id}] ${p.name} (${p.category})`));
  }

  // Show categories summary
  const categories = [...new Set(allProducts.map(p => p.category))];
  console.log(`\n📁  Active categories (${categories.length}): ${categories.join(', ')}`);

  console.log("\n✨  Done!\n");
  process.exit(0);
}

fixImages().catch((err) => {
  console.error("Fix failed:", err);
  process.exit(1);
});
