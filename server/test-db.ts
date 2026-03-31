import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { products } from "../drizzle/schema";
import { inArray } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const items = await db.select().from(products).where(inArray(products.name, [
    "Sacoche Shoulder Bag", 
    "Lounge Shorts", 
    "Pleated Chino"
  ]));
  console.log(JSON.stringify(items, null, 2));
  process.exit(0);
}
main();
