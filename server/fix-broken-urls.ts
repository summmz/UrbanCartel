/**
 * Fix broken image URLs in the database.
 * Run with: npx tsx server/fix-broken-urls.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, like, or, isNull } from "drizzle-orm";
import { products } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

// Known broken Unsplash photo IDs and their replacements
const BROKEN_TO_FIXED: Record<string, string> = {
  // Bottoms — the main broken one (404)
  "photo-1542272454315-4c01d7afdf4a": "photo-1541099649105-f69ad21f3246",
  // Other commonly broken ones
  "photo-1605087372369-c3e7e4c8a0c2": "photo-1614495039153-e9cd13240469",
  "photo-1517841905240-472988babdf9": "photo-1611312449412-6cefac5dc3e4",
  "photo-1576566588028-4147f3842f27": "photo-1529374255404-311a2a4f1fd9",
  "photo-1523381210434-271e8be1f52b": "photo-1473966968600-fa801b869a1a",
  "photo-1620799139507-2a76f79a2f4d": "photo-1434389677669-e08b4cda3007",
  "photo-1558618666-fcd25c85cd64": "photo-1514327605112-b887c0e61c0a",
  "photo-1576473582048-cb0c98e41f2a": "photo-1588850561407-ed78c334e67a",
  "photo-1624378439575-d8705ad7ae80": "photo-1594938298603-c8148c4dae35",
};

async function fixBrokenUrls() {
  console.log("\n🔧  Fixing broken image URLs in database...\n");

  let totalFixed = 0;

  for (const [brokenId, fixedId] of Object.entries(BROKEN_TO_FIXED)) {
    const brokenProducts = await db
      .select({ id: products.id, name: products.name, imageUrl: products.imageUrl })
      .from(products)
      .where(like(products.imageUrl, `%${brokenId}%`));

    if (brokenProducts.length > 0) {
      for (const p of brokenProducts) {
        const newUrl = p.imageUrl!.replace(brokenId, fixedId);
        await db.update(products).set({ imageUrl: newUrl }).where(eq(products.id, p.id));
        console.log(`  🔄  [${p.id}] ${p.name}: ${brokenId} → ${fixedId}`);
        totalFixed++;
      }
    }
  }

  // Also fix any remaining null/empty ones
  const empty = await db
    .select({ id: products.id, name: products.name, category: products.category })
    .from(products)
    .where(or(isNull(products.imageUrl), eq(products.imageUrl, "")));

  for (const p of empty) {
    const fallback = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800";
    await db.update(products).set({ imageUrl: fallback }).where(eq(products.id, p.id));
    console.log(`  🖼️  [${p.id}] ${p.name}: null → fallback image`);
    totalFixed++;
  }

  console.log(`\n✨  Fixed ${totalFixed} product image URLs.\n`);
  process.exit(0);
}

fixBrokenUrls().catch((err) => {
  console.error("Fix failed:", err);
  process.exit(1);
});
