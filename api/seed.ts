/**
 * TEMPORARY seed endpoint — DELETE THIS FILE after seeding!
 * Deploy to Vercel, call once, then remove.
 *
 * Usage:
 *   curl -X POST https://urban-cartel-three.vercel.app/api/seed \
 *     -H "x-seed-secret: urbancartel-seed-2024"
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { products, inventory } from "../drizzle/schema";

const SEED_PRODUCTS = [
  { name: "Void Oversized Hoodie", description: "550GSM heavyweight French terry, boxy drop-shoulder cut.", price: "89.00", category: "Hoodies", sku: "HD-001", stock: 42, imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800" },
  { name: "Phantom Zip-Up Hoodie", description: "Full-zip 400GSM fleece with contrast drawcords.", price: "95.00", category: "Hoodies", sku: "HD-002", stock: 28, imageUrl: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=800" },
  { name: "Cartel Graphic Hoodie", description: "450GSM pullover with large screen-printed front graphic.", price: "105.00", category: "Hoodies", sku: "HD-003", stock: 19, imageUrl: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&q=80&w=800" },
  { name: "Utility Patch Hoodie", description: "Military-inspired hoodie with embroidered patches.", price: "79.00", category: "Hoodies", sku: "HD-004", stock: 35, imageUrl: "https://images.unsplash.com/photo-1614495039153-e9cd13240469?auto=format&fit=crop&q=80&w=800" },
  { name: "Thermal Lined Pullover", description: "320GSM cotton fleece outer with quilted thermal lining.", price: "115.00", category: "Hoodies", sku: "HD-005", stock: 14, imageUrl: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=800" },
  { name: "Half-Zip Fleece Sweat", description: "Quarter-zip silhouette in premium 300GSM polar fleece.", price: "72.00", category: "Hoodies", sku: "HD-006", stock: 50, imageUrl: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?auto=format&fit=crop&q=80&w=800" },
  { name: "Washed Black Pullover", description: "500GSM garment-dyed heavyweight hoodie in deep washed black.", price: "110.00", category: "Hoodies", sku: "HD-007", stock: 24, imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800" },
  { name: "Sherpa Lined Hoodie", description: "Plush sherpa-lined interior with cotton terry exterior.", price: "135.00", category: "Hoodies", sku: "HD-008", stock: 18, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" },
  { name: "Essential Heavyweight Tee", description: "240GSM 100% ring-spun cotton. Dropped shoulders, boxy fit.", price: "38.00", category: "Tees", sku: "TE-001", stock: 80, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
  { name: "Distressed Acid Wash Tee", description: "220GSM cotton enzyme-washed and hand-distressed.", price: "55.00", category: "Tees", sku: "TE-002", stock: 22, imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800" },
  { name: "Longline Graphic Tee", description: "Extended-length 260GSM cotton tee with full-chest print.", price: "48.00", category: "Tees", sku: "TE-003", stock: 60, imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800" },
  { name: "Pigment-Dyed Pocket Tee", description: "200GSM slub cotton with garment pigment dye.", price: "42.00", category: "Tees", sku: "TE-004", stock: 45, imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=800" },
  { name: "Oversized Logo Tee", description: "260GSM single-jersey cotton with rubberised chest logo.", price: "52.00", category: "Tees", sku: "TE-005", stock: 70, imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800" },
  { name: "Striped Ringer Tee", description: "Retro-inspired 180GSM cotton ringer with contrast bands.", price: "35.00", category: "Tees", sku: "TE-006", stock: 55, imageUrl: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800" },
  { name: "Boxy Crop Tee", description: "220GSM cropped heavyweight tee. Dropped shoulders.", price: "40.00", category: "Tees", sku: "TE-007", stock: 38, imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800" },
  { name: "Mesh Panel Tee", description: "Technical cotton-mesh hybrid tee with ventilated side panels.", price: "58.00", category: "Tees", sku: "TE-008", stock: 32, imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800" },
  { name: "Technical Shell Jacket", description: "2.5-layer waterproof-breathable shell. Taped seams.", price: "220.00", category: "Outerwear", sku: "OW-001", stock: 18, imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800" },
  { name: "Varsity Bomber Jacket", description: "Wool-blend body with leather sleeves and rib-knit trim.", price: "195.00", category: "Outerwear", sku: "OW-002", stock: 12, imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800" },
  { name: "Puffer Coach Jacket", description: "Lightweight 80g fill quilted puffer in a coach silhouette.", price: "145.00", category: "Outerwear", sku: "OW-003", stock: 24, imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800" },
  { name: "Denim Utility Jacket", description: "14oz selvedge denim with oversized chest pockets.", price: "135.00", category: "Outerwear", sku: "OW-004", stock: 30, imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=800" },
  { name: "Fleece-Lined Track Top", description: "Polyester track jacket with brushed fleece interior.", price: "88.00", category: "Outerwear", sku: "OW-005", stock: 36, imageUrl: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&q=80&w=800" },
  { name: "Corduroy Overshirt", description: "Fine-wale corduroy in 100% cotton. Button-through front.", price: "110.00", category: "Outerwear", sku: "OW-006", stock: 20, imageUrl: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&q=80&w=800" },
  { name: "Windbreaker Anorak", description: "Half-zip anorak in DWR-coated nylon ripstop.", price: "98.00", category: "Outerwear", sku: "OW-007", stock: 27, imageUrl: "https://images.unsplash.com/photo-1545594861-3bef43ff2fc8?auto=format&fit=crop&q=80&w=800" },
  { name: "Structured 6-Panel Cap", description: "Cotton twill with structured front panels and pre-curved brim.", price: "38.00", category: "Accessories", sku: "AC-001", stock: 65, imageUrl: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800" },
  { name: "Reversible Bucket Hat", description: "Two-tone reversible bucket in nylon and cotton canvas.", price: "42.00", category: "Accessories", sku: "AC-002", stock: 48, imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800" },
  { name: "Tactical Crossbody Bag", description: "600D ripstop with MOLLE webbing and quick-release buckles.", price: "65.00", category: "Accessories", sku: "AC-003", stock: 30, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" },
  { name: "Knit Beanie", description: "Chunky 100% merino wool rib-knit beanie.", price: "28.00", category: "Accessories", sku: "AC-004", stock: 90, imageUrl: "https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?auto=format&fit=crop&q=80&w=800" },
  { name: "Woven Logo Belt", description: "35mm nylon webbing with embossed matte-black roller buckle.", price: "32.00", category: "Accessories", sku: "AC-005", stock: 55, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" },
  { name: "Utility Tote Bag", description: "14oz waxed canvas tote with leather handles and base.", price: "58.00", category: "Accessories", sku: "AC-006", stock: 25, imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800" },
  { name: "Logo Socks 3-Pack", description: "Premium combed cotton ribbed crew socks. Set of 3 pairs.", price: "24.00", category: "Accessories", sku: "AC-007", stock: 100, imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=800" },
  { name: "Tech Gloves", description: "Wind-resistant softshell gloves with touchscreen fingertips.", price: "35.00", category: "Accessories", sku: "AC-008", stock: 42, imageUrl: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800" },
  { name: "Cargo Utility Pants", description: "Ripstop nylon cargo with six pockets and adjustable hem ties.", price: "98.00", category: "Bottoms", sku: "BT-001", stock: 38, imageUrl: "https://images.unsplash.com/photo-1542272454315-4c01d7afdf4a?auto=format&fit=crop&q=80&w=800" },
  { name: "Wide-Leg Denim", description: "12oz Japanese denim, straight wide-leg silhouette.", price: "115.00", category: "Bottoms", sku: "BT-002", stock: 26, imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800" },
  { name: "Relaxed Jogger", description: "320GSM brushed-back fleece joggers with elasticated waistband.", price: "75.00", category: "Bottoms", sku: "BT-003", stock: 50, imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800" },
  { name: "Nylon Track Pants", description: "Lightweight nylon with contrast side stripe.", price: "82.00", category: "Bottoms", sku: "BT-004", stock: 44, imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800" },
  { name: "Pleated Chino", description: "230GSM stretch cotton-twill with double forward pleats.", price: "92.00", category: "Bottoms", sku: "BT-005", stock: 32, imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800" },
  { name: "Athletic Shorts", description: "4-way stretch mesh shorts, 7-inch inseam.", price: "52.00", category: "Bottoms", sku: "BT-006", stock: 60, imageUrl: "https://images.unsplash.com/photo-1562886877-aaaa5c17965a?auto=format&fit=crop&q=80&w=800" },
  { name: "Corduroy Wide Pants", description: "Thick-wale corduroy in relaxed wide-leg silhouette.", price: "105.00", category: "Bottoms", sku: "BT-007", stock: 22, imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800" },
  { name: "Tech Cargo Jogger", description: "Hybrid jogger with articulated knees and magnetic cargo pockets.", price: "118.00", category: "Bottoms", sku: "BT-008", stock: 28, imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800" },
  { name: "Chunky Sole Trainer", description: "Ergonomic EVA midsole with 40mm stack height.", price: "145.00", category: "Footwear", sku: "FW-001", stock: 30, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" },
  { name: "Low-Top Canvas Sneaker", description: "Vulcanised canvas low-top with herringbone outsole.", price: "72.00", category: "Footwear", sku: "FW-002", stock: 55, imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800" },
  { name: "Technical Running Shoe", description: "Carbon-fibre-infused plate, 3-layer foam stack.", price: "185.00", category: "Footwear", sku: "FW-003", stock: 18, imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800" },
  { name: "Suede Lug-Sole Boot", description: "Premium split-suede upper on a lugged commando sole.", price: "215.00", category: "Footwear", sku: "FW-004", stock: 14, imageUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800" },
  { name: "Slip-On Mule", description: "Neoprene upper with memory-foam footbed and EVA outsole.", price: "65.00", category: "Footwear", sku: "FW-005", stock: 40, imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=800" },
  { name: "High-Top Leather Sneaker", description: "Full-grain leather upper with padded ankle collar.", price: "155.00", category: "Footwear", sku: "FW-006", stock: 22, imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800" },
  { name: "Platform Sole Sneaker", description: "Elevated chunky platform with 50mm sole height.", price: "168.00", category: "Footwear", sku: "FW-007", stock: 16, imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800" },
  { name: "5-Panel Camp Cap", description: "Unstructured 5-panel in washed cotton canvas.", price: "36.00", category: "Headwear", sku: "HW-001", stock: 60, imageUrl: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&q=80&w=800" },
  { name: "Dad Hat", description: "Soft unstructured cotton twill with curved brim.", price: "32.00", category: "Headwear", sku: "HW-002", stock: 75, imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800" },
  { name: "Wool Felt Fedora", description: "100% wool felt with grosgrain ribbon band.", price: "88.00", category: "Headwear", sku: "HW-003", stock: 20, imageUrl: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&q=80&w=800" },
  { name: "Ribbed Watch Cap", description: "100% merino wool fine-rib beanie. Single-fold cuff.", price: "24.00", category: "Headwear", sku: "HW-004", stock: 100, imageUrl: "https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?auto=format&fit=crop&q=80&w=800" },
  { name: "Wide-Brim Bucket", description: "Cotton canvas bucket with wide structured brim. UPF 50+.", price: "45.00", category: "Headwear", sku: "HW-005", stock: 38, imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800" },
  { name: "Trucker Snapback", description: "Foam front panels with mesh back for breathability.", price: "38.00", category: "Headwear", sku: "HW-006", stock: 48, imageUrl: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800" },
  { name: "Chunky Rib Sweater", description: "100% merino wool in a bold vertical rib.", price: "135.00", category: "Knitwear", sku: "KN-001", stock: 22, imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800" },
  { name: "Open-Knit Polo", description: "Lightweight cotton-linen open-weave polo.", price: "92.00", category: "Knitwear", sku: "KN-002", stock: 30, imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&q=80&w=800" },
  { name: "Intarsia Logo Knit", description: "Jacquard-knit sweater with intarsia logo detail.", price: "115.00", category: "Knitwear", sku: "KN-003", stock: 18, imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800" },
  { name: "Mock-Neck Thermal", description: "240GSM cotton-modal waffle-knit mock-neck.", price: "68.00", category: "Knitwear", sku: "KN-004", stock: 45, imageUrl: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=800" },
  { name: "Cardigan Overshirt", description: "Open-front cardigan in 100% lambswool.", price: "145.00", category: "Knitwear", sku: "KN-005", stock: 16, imageUrl: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&q=80&w=800" },
  { name: "Fisherman Knit Vest", description: "Classic cable-knit in 100% cotton. Sleeveless V-neck.", price: "78.00", category: "Knitwear", sku: "KN-006", stock: 28, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
  { name: "Cloud Fleece Set", description: "Matching pullover and jogger in 380GSM micro-fleece.", price: "125.00", category: "Loungewear", sku: "LW-001", stock: 35, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" },
  { name: "Waffle-Knit Robe", description: "Full-length cotton waffle robe with shawl collar.", price: "95.00", category: "Loungewear", sku: "LW-002", stock: 20, imageUrl: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=800" },
  { name: "Lounge Shorts", description: "200GSM cotton-modal shorts with elasticated waistband.", price: "42.00", category: "Loungewear", sku: "LW-003", stock: 65, imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?auto=format&fit=crop&q=80&w=800" },
  { name: "Modal Sleep Tee", description: "Ultrasoft 160GSM modal jersey. Oversized drop-shoulder fit.", price: "38.00", category: "Loungewear", sku: "LW-004", stock: 80, imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800" },
  { name: "Ribbed Tank Set", description: "Two-piece 220GSM cotton rib tank and shorts set.", price: "72.00", category: "Loungewear", sku: "LW-005", stock: 40, imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800" },
  { name: "Oversized Sweatpant", description: "480GSM garment-dyed fleece sweatpant.", price: "85.00", category: "Loungewear", sku: "LW-006", stock: 30, imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800" },
  { name: "Nylon Duffle Bag", description: "840D ballistic nylon duffle with detachable shoulder strap.", price: "125.00", category: "Bags", sku: "BG-001", stock: 20, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" },
  { name: "Mini Crossbody Pouch", description: "Compact 600D cordura pouch with adjustable webbing strap.", price: "45.00", category: "Bags", sku: "BG-002", stock: 55, imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800" },
  { name: "Roll-Top Backpack", description: "25L roll-top closure in weatherproof tarpaulin.", price: "148.00", category: "Bags", sku: "BG-003", stock: 18, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" },
  { name: "Sacoche Shoulder Bag", description: "Japanese-inspired sacoche in X-Pac fabric.", price: "68.00", category: "Bags", sku: "BG-004", stock: 35, imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800" },
  { name: "Canvas Market Tote", description: "18oz heavyweight canvas with leather reinforced handles.", price: "52.00", category: "Bags", sku: "BG-005", stock: 40, imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800" },
  { name: "Waist Bag", description: "Adjustable belt bag in water-repellent nylon.", price: "55.00", category: "Bags", sku: "BG-006", stock: 45, imageUrl: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800" },
  { name: "Cuban Link Chain", description: "18K gold-plated stainless steel Cuban link. 6mm width.", price: "85.00", category: "Jewelry", sku: "JW-001", stock: 30, imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=80&w=800" },
  { name: "Signet Ring", description: "Brushed stainless steel signet ring with matte-black enamel.", price: "48.00", category: "Jewelry", sku: "JW-002", stock: 50, imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800" },
  { name: "Layered Pendant Necklace", description: "Double-layer chain in surgical steel.", price: "62.00", category: "Jewelry", sku: "JW-003", stock: 38, imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" },
  { name: "Bead Bracelet Set", description: "Set of three stretch bracelets: matte onyx, tiger eye, metal.", price: "35.00", category: "Jewelry", sku: "JW-004", stock: 60, imageUrl: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800" },
  { name: "Hoop Earrings", description: "20mm polished stainless steel hoops. Sold as pair.", price: "28.00", category: "Jewelry", sku: "JW-005", stock: 70, imageUrl: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800" },
  { name: "Chain Bracelet", description: "Figaro-link bracelet in gold-plated 316L steel.", price: "42.00", category: "Jewelry", sku: "JW-006", stock: 45, imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800" },
  { name: "Board Shorts", description: "Quick-dry stretch nylon board shorts with 17-inch outseam.", price: "65.00", category: "Swimwear", sku: "SW-001", stock: 30, imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800" },
  { name: "Swim Trunks", description: "Recycled polyester 5-inch trunk with mesh liner.", price: "55.00", category: "Swimwear", sku: "SW-002", stock: 42, imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800" },
  { name: "Rash Guard", description: "UPF 50+ long-sleeve swim top in four-way stretch fabric.", price: "58.00", category: "Swimwear", sku: "SW-003", stock: 25, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800" },
  { name: "Terry Cabana Shirt", description: "Open-collar terry cloth shirt in a relaxed camp-collar silhouette.", price: "72.00", category: "Swimwear", sku: "SW-004", stock: 20, imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800" },
  { name: "Swim Short – Print", description: "Mid-length swim short in recycled nylon with all-over print.", price: "62.00", category: "Swimwear", sku: "SW-005", stock: 35, imageUrl: "https://images.unsplash.com/photo-1520942702018-0862200e6873?auto=format&fit=crop&q=80&w=800" },
  { name: "Towel Poncho", description: "Oversized terry poncho with hood. Quick-dry microfiber blend.", price: "78.00", category: "Swimwear", sku: "SW-006", stock: 15, imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=800" },
  { name: "Archive Hoodie — Sale", description: "From last season's archive drop. 400GSM pullover. Final sale.", price: "45.00", category: "Sale", sku: "SL-001", stock: 8, imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800" },
  { name: "Surplus Coach Jacket — Sale", description: "Windbreaker coach jacket from previous collection. Final sale.", price: "60.00", category: "Sale", sku: "SL-002", stock: 5, imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800" },
  { name: "Sample Tee Pack — Sale", description: "Three-pack of overrun sample tees, mixed colourways.", price: "55.00", category: "Sale", sku: "SL-003", stock: 15, imageUrl: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800" },
  { name: "Deadstock Cargo Pants — Sale", description: "End-of-line cargo pants in olive. Full stock, no defects.", price: "58.00", category: "Sale", sku: "SL-004", stock: 10, imageUrl: "https://images.unsplash.com/photo-1542272454315-4c01d7afdf4a?auto=format&fit=crop&q=80&w=800" },
  { name: "Overrun Knitwear — Sale", description: "Production overrun merino crewneck. No defects.", price: "49.00", category: "Sale", sku: "SL-005", stock: 12, imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800" },
  { name: "Deadstock Sneakers — Sale", description: "Previous-season chunky trainers, select sizes only.", price: "89.00", category: "Sale", sku: "SL-006", stock: 7, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" },
  { name: "End-of-Line Belt — Sale", description: "Discontinued 35mm nylon belt in camo print.", price: "18.00", category: "Sale", sku: "SL-007", stock: 20, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" },
  { name: "Sample Shorts 2-Pack — Sale", description: "Two-pack of overrun athletic shorts. Mixed colours.", price: "38.00", category: "Sale", sku: "SL-008", stock: 14, imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?auto=format&fit=crop&q=80&w=800" },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = req.headers["x-seed-secret"];
  if (secret !== "urbancartel-seed-2024") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL not set on Vercel" });
  }

  const db = drizzle(process.env.DATABASE_URL);
  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const p of SEED_PRODUCTS) {
    try {
      const existing = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.sku, p.sku))
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      const result = await db.insert(products).values({
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        sku: p.sku,
        stock: p.stock,
        imageUrl: p.imageUrl,
        isActive: true,
      });

      const productId = (result as any)[0].insertId;

      await db.insert(inventory).values({
        productId,
        quantityOnHand: p.stock,
        quantityReserved: 0,
        reorderLevel: 10,
        warehouseLocation: "Warehouse A",
      });

      inserted++;
    } catch (err: any) {
      errors.push(`${p.sku}: ${err.message}`);
    }
  }

  return res.status(200).json({
    success: true,
    inserted,
    skipped,
    errors,
    message: `Done! ${inserted} inserted, ${skipped} skipped. DELETE api/seed.ts now!`,
  });
}
