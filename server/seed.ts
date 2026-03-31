/**
 * Seed script — run with:
 *   pnpm db:seed
 *
 * Safe to re-run — skips any SKU that already exists.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { products, inventory } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const SEED_PRODUCTS = [
  // ── HOODIES ──────────────────────────────────────────────────────────────
  { name: "Void Oversized Hoodie", description: "550GSM heavyweight French terry, boxy drop-shoulder cut. Pre-washed for immediate comfort. Kangaroo pocket with internal media sleeve.", price: "89.00", category: "Hoodies", sku: "HD-001", stock: 42, imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800" },
  { name: "Phantom Zip-Up Hoodie", description: "Full-zip 400GSM fleece with contrast drawcords. Double-lined hood, YKK zipper, two hand pockets. Relaxed fit with subtle tonal logo.", price: "95.00", category: "Hoodies", sku: "HD-002", stock: 28, imageUrl: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=800" },
  { name: "Cartel Graphic Hoodie", description: "450GSM pullover with large screen-printed front graphic. Garment-dyed for a lived-in feel. Oversized fit, unisex sizing.", price: "105.00", category: "Hoodies", sku: "HD-003", stock: 19, imageUrl: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&q=80&w=800" },
  { name: "Utility Patch Hoodie", description: "Military-inspired hoodie with embroidered patches and woven labels. 380GSM brushed-back fleece. Regular fit with adjustable hood.", price: "79.00", category: "Hoodies", sku: "HD-004", stock: 35, imageUrl: "https://images.unsplash.com/photo-1614495039153-e9cd13240469?auto=format&fit=crop&q=80&w=800" },
  { name: "Thermal Lined Pullover", description: "320GSM cotton fleece outer with quilted thermal lining through the body. Extended length, side pockets, split hem.", price: "115.00", category: "Hoodies", sku: "HD-005", stock: 14, imageUrl: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=800" },
  { name: "Half-Zip Fleece Sweat", description: "Quarter-zip silhouette in premium 300GSM polar fleece. Contrast media pocket on sleeve. Boxy fit, ribbed collar.", price: "72.00", category: "Hoodies", sku: "HD-006", stock: 50, imageUrl: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?auto=format&fit=crop&q=80&w=800" },
  { name: "Washed Black Pullover", description: "500GSM garment-dyed heavyweight hoodie in deep washed black. Oversized kangaroo pocket, double-layer hood. Statement minimal piece.", price: "110.00", category: "Hoodies", sku: "HD-007", stock: 24, imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800" },
  { name: "Sherpa Lined Hoodie", description: "Plush sherpa-lined interior with cotton terry exterior. Drawcord hood, side-entry pockets. The ultimate cold-weather hoodie.", price: "135.00", category: "Hoodies", sku: "HD-008", stock: 18, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" },

  // ── TEES ─────────────────────────────────────────────────────────────────
  { name: "Essential Heavyweight Tee", description: "240GSM 100% ring-spun cotton. Dropped shoulders, boxy fit, reinforced crew neck. The blank canvas of your wardrobe.", price: "38.00", category: "Tees", sku: "TE-001", stock: 80, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
  { name: "Distressed Acid Wash Tee", description: "220GSM cotton enzyme-washed and hand-distressed. No two are identical. Relaxed fit, raw hem.", price: "55.00", category: "Tees", sku: "TE-002", stock: 22, imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800" },
  { name: "Longline Graphic Tee", description: "Extended-length 260GSM cotton tee with full-chest print. Curved hem, double-stitched sleeves. Oversized silhouette.", price: "48.00", category: "Tees", sku: "TE-003", stock: 60, imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800" },
  { name: "Pigment-Dyed Pocket Tee", description: "200GSM slub cotton with garment pigment dye. Chest pocket with embroidered detail. Regular fit.", price: "42.00", category: "Tees", sku: "TE-004", stock: 45, imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=800" },
  { name: "Oversized Logo Tee", description: "260GSM single-jersey cotton with rubberised chest logo. Boxy cut, dropped shoulders. Washed black, natural, and slate.", price: "52.00", category: "Tees", sku: "TE-005", stock: 70, imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800" },
  { name: "Striped Ringer Tee", description: "Retro-inspired 180GSM cotton ringer with contrast neck and sleeve bands. Fitted silhouette, ribbed collar.", price: "35.00", category: "Tees", sku: "TE-006", stock: 55, imageUrl: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800" },
  { name: "Boxy Crop Tee", description: "220GSM cropped heavyweight tee. Dropped shoulders, wide neck binding. Raw-edge hem for that DIY feel.", price: "40.00", category: "Tees", sku: "TE-007", stock: 38, imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800" },
  { name: "Mesh Panel Tee", description: "Technical cotton-mesh hybrid tee with ventilated side panels. Moisture-wicking, 200GSM. Reflective back logo.", price: "58.00", category: "Tees", sku: "TE-008", stock: 32, imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800" },

  // ── OUTERWEAR ─────────────────────────────────────────────────────────────
  { name: "Technical Shell Jacket", description: "2.5-layer waterproof-breathable shell. Taped seams, YKK AquaGuard zippers, underarm vents. Packable into chest pocket.", price: "220.00", category: "Outerwear", sku: "OW-001", stock: 18, imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800" },
  { name: "Varsity Bomber Jacket", description: "Wool-blend body with leather sleeves and rib-knit trim. Satin lining with interior pockets. Classic letterman silhouette.", price: "195.00", category: "Outerwear", sku: "OW-002", stock: 12, imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800" },
  { name: "Puffer Coach Jacket", description: "Lightweight 80g fill quilted puffer in a coach silhouette. Wind-resistant nylon shell, snap buttons, side-entry pockets.", price: "145.00", category: "Outerwear", sku: "OW-003", stock: 24, imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800" },
  { name: "Denim Utility Jacket", description: "14oz selvedge denim with oversized chest pockets, storm flap, and adjustable cuffs. Washed black finish.", price: "135.00", category: "Outerwear", sku: "OW-004", stock: 30, imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=800" },
  { name: "Fleece-Lined Track Top", description: "Polyester track jacket with brushed fleece interior. Contrast piping, full zip, two side pockets. Retro athletic feel.", price: "88.00", category: "Outerwear", sku: "OW-005", stock: 36, imageUrl: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&q=80&w=800" },
  { name: "Corduroy Overshirt", description: "Fine-wale corduroy in 100% cotton. Button-through front, two chest pockets, shirttail hem.", price: "110.00", category: "Outerwear", sku: "OW-006", stock: 20, imageUrl: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&q=80&w=800" },
  { name: "Windbreaker Anorak", description: "Half-zip anorak in DWR-coated nylon ripstop. Kangaroo pouch pocket, elasticated hem, hood with peak. Ultra-packable.", price: "98.00", category: "Outerwear", sku: "OW-007", stock: 27, imageUrl: "https://images.unsplash.com/photo-1545594861-3bef43ff2fc8?auto=format&fit=crop&q=80&w=800" },

  // ── ACCESSORIES ───────────────────────────────────────────────────────────
  { name: "Structured 6-Panel Cap", description: "Cotton twill with structured front panels and pre-curved brim. Embroidered eyelets and sweatband. Adjustable snapback closure.", price: "38.00", category: "Accessories", sku: "AC-001", stock: 65, imageUrl: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800" },
  { name: "Reversible Bucket Hat", description: "Two-tone reversible bucket in nylon and cotton canvas. Packable, UPF 40+, hidden brim wire for shaping.", price: "42.00", category: "Accessories", sku: "AC-002", stock: 48, imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800" },
  { name: "Tactical Crossbody Bag", description: "600D ripstop with MOLLE webbing and quick-release buckles. Main compartment + two zip pockets. Padded back panel.", price: "65.00", category: "Accessories", sku: "AC-003", stock: 30, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" },
  { name: "Knit Beanie", description: "Chunky 100% merino wool rib-knit beanie. Double-layered cuff, pom-pom top. One size fits all.", price: "28.00", category: "Accessories", sku: "AC-004", stock: 90, imageUrl: "https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?auto=format&fit=crop&q=80&w=800" },
  { name: "Woven Logo Belt", description: "35mm nylon webbing with embossed matte-black roller buckle. Adjustable up to 46 inches.", price: "32.00", category: "Accessories", sku: "AC-005", stock: 55, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" },
  { name: "Utility Tote Bag", description: "14oz waxed canvas tote with leather handles and base. Internal zip pocket, magnetic snap closure. Fits 15\" laptop.", price: "58.00", category: "Accessories", sku: "AC-006", stock: 25, imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800" },
  { name: "Logo Socks 3-Pack", description: "Premium combed cotton ribbed crew socks. Embroidered logo on cuff, reinforced heel and toe. Set of 3 pairs.", price: "24.00", category: "Accessories", sku: "AC-007", stock: 100, imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=800" },
  { name: "Tech Gloves", description: "Wind-resistant softshell gloves with touchscreen-compatible fingertips. Silicone grip palm, fleece-lined interior.", price: "35.00", category: "Accessories", sku: "AC-008", stock: 42, imageUrl: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800" },

  // ── BOTTOMS ───────────────────────────────────────────────────────────────
  { name: "Cargo Utility Pants", description: "Ripstop nylon cargo with six pockets and adjustable hem ties. Relaxed fit through the hip and thigh, tapered below the knee.", price: "98.00", category: "Bottoms", sku: "BT-001", stock: 38, imageUrl: "https://images.unsplash.com/photo-1542272454315-4c01d7afdf4a?auto=format&fit=crop&q=80&w=800" },
  { name: "Wide-Leg Denim", description: "12oz Japanese denim, straight wide-leg silhouette. Five-pocket construction, raw hem, medium blue wash. Unisex sizing.", price: "115.00", category: "Bottoms", sku: "BT-002", stock: 26, imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800" },
  { name: "Relaxed Jogger", description: "320GSM brushed-back fleece joggers with elasticated waistband and cuffed hem. Two side pockets, rear zip pocket.", price: "75.00", category: "Bottoms", sku: "BT-003", stock: 50, imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800" },
  { name: "Nylon Track Pants", description: "Lightweight nylon with contrast side stripe and snap-button ankle openings. Elasticated waist with internal drawcord.", price: "82.00", category: "Bottoms", sku: "BT-004", stock: 44, imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800" },
  { name: "Pleated Chino", description: "230GSM stretch cotton-twill with double forward pleats. Tapered leg, welt back pockets. Smart-casual silhouette.", price: "92.00", category: "Bottoms", sku: "BT-005", stock: 32, imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800" },
  { name: "Athletic Shorts", description: "4-way stretch mesh shorts, 7-inch inseam. Side split hem, internal compression liner, zip back pocket.", price: "52.00", category: "Bottoms", sku: "BT-006", stock: 60, imageUrl: "https://images.unsplash.com/photo-1562886877-aaaa5c17965a?auto=format&fit=crop&q=80&w=800" },
  { name: "Corduroy Wide Pants", description: "Thick-wale corduroy in relaxed wide-leg silhouette. High waist, double-pleat front. Vintage-inspired earth tones.", price: "105.00", category: "Bottoms", sku: "BT-007", stock: 22, imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800" },
  { name: "Tech Cargo Jogger", description: "Hybrid jogger with articulated knees and magnetic cargo pockets. Four-way stretch, water-repellent finish.", price: "118.00", category: "Bottoms", sku: "BT-008", stock: 28, imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800" },

  // ── FOOTWEAR ─────────────────────────────────────────────────────────────
  { name: "Chunky Sole Trainer", description: "Ergonomic EVA midsole with 40mm stack height. Breathable mesh upper, TPU overlays, and gum rubber outsole. Runs true to size.", price: "145.00", category: "Footwear", sku: "FW-001", stock: 30, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" },
  { name: "Low-Top Canvas Sneaker", description: "Vulcanised canvas low-top with herringbone outsole. Reinforced toe cap, padded collar, waxed laces.", price: "72.00", category: "Footwear", sku: "FW-002", stock: 55, imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800" },
  { name: "Technical Running Shoe", description: "Carbon-fibre-infused plate, 3-layer foam stack. Engineered knit upper with internal heel counter. Race or street.", price: "185.00", category: "Footwear", sku: "FW-003", stock: 18, imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800" },
  { name: "Suede Lug-Sole Boot", description: "Premium split-suede upper on a lugged commando sole. Goodyear-welt construction, steel shank, waterproof lining.", price: "215.00", category: "Footwear", sku: "FW-004", stock: 14, imageUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800" },
  { name: "Slip-On Mule", description: "Neoprene upper with memory-foam footbed and EVA outsole. Backless silhouette, logo debossed on the heel strap.", price: "65.00", category: "Footwear", sku: "FW-005", stock: 40, imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=800" },
  { name: "High-Top Leather Sneaker", description: "Full-grain leather upper with padded ankle collar. Air-cushion midsole, pivot point outsole, brushed metal eyelets.", price: "155.00", category: "Footwear", sku: "FW-006", stock: 22, imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800" },
  { name: "Platform Sole Sneaker", description: "Elevated chunky platform with 50mm sole height. Premium leather upper with suede tongue. Statement street silhouette.", price: "168.00", category: "Footwear", sku: "FW-007", stock: 16, imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800" },

  // ── HEADWEAR ─────────────────────────────────────────────────────────────
  { name: "5-Panel Camp Cap", description: "Unstructured 5-panel in washed cotton canvas. Flat brim, self-fabric strap with brass slider. Low-profile street silhouette.", price: "36.00", category: "Headwear", sku: "HW-001", stock: 60, imageUrl: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&q=80&w=800" },
  { name: "Dad Hat", description: "Soft unstructured cotton twill with curved brim and brass buckle strap. Embroidered logo on front panel.", price: "32.00", category: "Headwear", sku: "HW-002", stock: 75, imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800" },
  { name: "Wool Felt Fedora", description: "100% wool felt with grosgrain ribbon band. Pinch-front crown, raw edge brim. Water-resistant finish.", price: "88.00", category: "Headwear", sku: "HW-003", stock: 20, imageUrl: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&q=80&w=800" },
  { name: "Ribbed Watch Cap", description: "100% merino wool fine-rib beanie. Single-fold cuff, no logo. The essential winter layer.", price: "24.00", category: "Headwear", sku: "HW-004", stock: 100, imageUrl: "https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?auto=format&fit=crop&q=80&w=800" },
  { name: "Wide-Brim Bucket", description: "Cotton canvas bucket with wide structured brim, chin-cord grommets, and sweatband. UPF 50+.", price: "45.00", category: "Headwear", sku: "HW-005", stock: 38, imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800" },
  { name: "Trucker Snapback", description: "Foam front panels with mesh back for breathability. Structured high-crown silhouette, flat brim, snapback closure.", price: "38.00", category: "Headwear", sku: "HW-006", stock: 48, imageUrl: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800" },

  // ── KNITWEAR ──────────────────────────────────────────────────────────────
  { name: "Chunky Rib Sweater", description: "100% merino wool in a bold vertical rib. Relaxed boxy fit, crew neck, dropped shoulders. Hand-wash cold.", price: "135.00", category: "Knitwear", sku: "KN-001", stock: 22, imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800" },
  { name: "Open-Knit Polo", description: "Lightweight cotton-linen open-weave polo. Short sleeves, two-button placket, relaxed fit. Breathable for all seasons.", price: "92.00", category: "Knitwear", sku: "KN-002", stock: 30, imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&q=80&w=800" },
  { name: "Intarsia Logo Knit", description: "Jacquard-knit sweater with intarsia logo detail. Cotton-acrylic blend, crew neck, regular fit.", price: "115.00", category: "Knitwear", sku: "KN-003", stock: 18, imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800" },
  { name: "Mock-Neck Thermal", description: "240GSM cotton-modal waffle-knit mock-neck. Slim fit, flatlock seams, brushed interior. Layering essential.", price: "68.00", category: "Knitwear", sku: "KN-004", stock: 45, imageUrl: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=800" },
  { name: "Cardigan Overshirt", description: "Open-front cardigan in 100% lambswool. Four patch pockets, corozo-button closure, shawl collar. Oversized fit.", price: "145.00", category: "Knitwear", sku: "KN-005", stock: 16, imageUrl: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&q=80&w=800" },
  { name: "Fisherman Knit Vest", description: "Classic cable-knit in 100% cotton. Sleeveless V-neck silhouette. Layer over shirts or wear as a standalone.", price: "78.00", category: "Knitwear", sku: "KN-006", stock: 28, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },

  // ── LOUNGEWEAR ────────────────────────────────────────────────────────────
  { name: "Cloud Fleece Set", description: "Matching pullover and jogger in 380GSM micro-fleece. Brushed interior, elasticated waistband, dropped shoulder. Sold as set.", price: "125.00", category: "Loungewear", sku: "LW-001", stock: 35, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" },
  { name: "Waffle-Knit Robe", description: "Full-length cotton waffle robe with shawl collar. Two patch pockets, tie belt, single-button cuff. Unisex sizing.", price: "95.00", category: "Loungewear", sku: "LW-002", stock: 20, imageUrl: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=800" },
  { name: "Lounge Shorts", description: "200GSM cotton-modal shorts with elasticated waistband and drawcord. 5-inch inseam, side seam pockets.", price: "42.00", category: "Loungewear", sku: "LW-003", stock: 65, imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?auto=format&fit=crop&q=80&w=800" },
  { name: "Modal Sleep Tee", description: "Ultrasoft 160GSM modal jersey. Oversized drop-shoulder fit, curved hem. The lightest tee in the range.", price: "38.00", category: "Loungewear", sku: "LW-004", stock: 80, imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800" },
  { name: "Ribbed Tank Set", description: "Two-piece 220GSM cotton rib tank and shorts set. Scoop neck, relaxed cut, matching elastic waistband.", price: "72.00", category: "Loungewear", sku: "LW-005", stock: 40, imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800" },
  { name: "Oversized Sweatpant", description: "480GSM garment-dyed fleece sweatpant. Elasticated waist, tapered cuff, side and rear pockets. Ultra-relaxed silhouette.", price: "85.00", category: "Loungewear", sku: "LW-006", stock: 30, imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800" },

  // ── BAGS ──────────────────────────────────────────────────────────────────
  { name: "Nylon Duffle Bag", description: "840D ballistic nylon duffle with detachable shoulder strap. Dual-zip main compartment, shoe compartment base, grab handles.", price: "125.00", category: "Bags", sku: "BG-001", stock: 20, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" },
  { name: "Mini Crossbody Pouch", description: "Compact 600D cordura pouch with adjustable webbing strap. Front zip pocket, key clip, reflective pull tabs.", price: "45.00", category: "Bags", sku: "BG-002", stock: 55, imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800" },
  { name: "Roll-Top Backpack", description: "25L roll-top closure in weatherproof tarpaulin. Padded laptop sleeve, sternum strap, hidden back pocket. Welded seams.", price: "148.00", category: "Bags", sku: "BG-003", stock: 18, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" },
  { name: "Sacoche Shoulder Bag", description: "Japanese-inspired sacoche in X-Pac fabric. Minimal profile, crossbody strap with quick-adjust buckle. Ultralight construction.", price: "68.00", category: "Bags", sku: "BG-004", stock: 35, imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800" },
  { name: "Canvas Market Tote", description: "18oz heavyweight canvas with leather reinforced handles. Unlined interior, internal slip pocket. Raw canvas patinas with age.", price: "52.00", category: "Bags", sku: "BG-005", stock: 40, imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800" },
  { name: "Waist Bag", description: "Adjustable belt bag in water-repellent nylon with YKK zips. Two compartments, reflective accents. One-size fits all.", price: "55.00", category: "Bags", sku: "BG-006", stock: 45, imageUrl: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800" },

  // ── JEWELRY ───────────────────────────────────────────────────────────────
  { name: "Cuban Link Chain", description: "18K gold-plated stainless steel Cuban link. 6mm width, 20-inch length. Tarnish-resistant, hypoallergenic.", price: "85.00", category: "Jewelry", sku: "JW-001", stock: 30, imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=80&w=800" },
  { name: "Signet Ring", description: "Brushed stainless steel signet ring with matte-black enamel inlay. Comfort-fit band, 14mm face.", price: "48.00", category: "Jewelry", sku: "JW-002", stock: 50, imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800" },
  { name: "Layered Pendant Necklace", description: "Double-layer chain in surgical steel. Logo pendant on 18-inch, bar pendant on 22-inch. Lobster-claw closure.", price: "62.00", category: "Jewelry", sku: "JW-003", stock: 38, imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" },
  { name: "Bead Bracelet Set", description: "Set of three stretch bracelets: matte onyx, tiger eye, and brushed metal. 8mm beads, one-size elastic.", price: "35.00", category: "Jewelry", sku: "JW-004", stock: 60, imageUrl: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800" },
  { name: "Hoop Earrings", description: "20mm polished stainless steel hoops with hinged snap closure. Lightweight, hypoallergenic. Sold as pair.", price: "28.00", category: "Jewelry", sku: "JW-005", stock: 70, imageUrl: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800" },
  { name: "Chain Bracelet", description: "Figaro-link bracelet in gold-plated 316L steel. 8-inch length with 2-inch extender. Heavy 5mm gauge.", price: "42.00", category: "Jewelry", sku: "JW-006", stock: 45, imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800" },

  // ── SWIMWEAR ──────────────────────────────────────────────────────────────
  { name: "Board Shorts", description: "Quick-dry stretch nylon board shorts with 17-inch outseam. Welded zip pocket, flat drawcord waist. Tonal print.", price: "65.00", category: "Swimwear", sku: "SW-001", stock: 30, imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800" },
  { name: "Swim Trunks", description: "Recycled polyester 5-inch trunk with mesh liner. Elastic waistband, side pockets, back zip pocket. Quick-dry.", price: "55.00", category: "Swimwear", sku: "SW-002", stock: 42, imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800" },
  { name: "Rash Guard", description: "UPF 50+ long-sleeve swim top in four-way stretch fabric. Flatlock seams, thumb loops. Chlorine-resistant.", price: "58.00", category: "Swimwear", sku: "SW-003", stock: 25, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800" },
  { name: "Terry Cabana Shirt", description: "Open-collar terry cloth shirt in a relaxed camp-collar silhouette. Perfect poolside layering piece.", price: "72.00", category: "Swimwear", sku: "SW-004", stock: 20, imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800" },
  { name: "Swim Short – Print", description: "Mid-length swim short in recycled nylon with all-over seasonal print. Elasticated drawcord, mesh liner.", price: "62.00", category: "Swimwear", sku: "SW-005", stock: 35, imageUrl: "https://images.unsplash.com/photo-1520942702018-0862200e6873?auto=format&fit=crop&q=80&w=800" },
  { name: "Towel Poncho", description: "Oversized terry poncho with hood. Quick-dry microfiber blend, split kangaroo pocket. One-size.", price: "78.00", category: "Swimwear", sku: "SW-006", stock: 15, imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=800" },

  // ── SALE ─────────────────────────────────────────────────────────────────
  { name: "Archive Hoodie — Sale", description: "From last season's archive drop. 400GSM pullover, embroidered back graphic. Minor cosmetic markings on inner tag. Final sale.", price: "45.00", category: "Sale", sku: "SL-001", stock: 8, imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800" },
  { name: "Surplus Coach Jacket — Sale", description: "Windbreaker coach jacket from previous collection. Nylon ripstop, pack-away hood. Slight discolouration on left cuff. Final sale.", price: "60.00", category: "Sale", sku: "SL-002", stock: 5, imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800" },
  { name: "Sample Tee Pack — Sale", description: "Three-pack of overrun sample tees, mixed colourways and graphics. 240GSM cotton. Sizes may vary.", price: "55.00", category: "Sale", sku: "SL-003", stock: 15, imageUrl: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800" },
  { name: "Deadstock Cargo Pants — Sale", description: "End-of-line cargo pants in olive. Full stock, no defects — discontinued colourway. 100% original condition.", price: "58.00", category: "Sale", sku: "SL-004", stock: 10, imageUrl: "https://images.unsplash.com/photo-1542272454315-4c01d7afdf4a?auto=format&fit=crop&q=80&w=800" },
  { name: "Overrun Knitwear — Sale", description: "Production overrun merino crewneck, limited sizes. No defects, simply excess inventory cleared at cost.", price: "49.00", category: "Sale", sku: "SL-005", stock: 12, imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800" },
  { name: "Deadstock Sneakers — Sale", description: "Previous-season chunky trainers, select sizes only. Original packaging, no wear. Discontinued colourway.", price: "89.00", category: "Sale", sku: "SL-006", stock: 7, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" },
  { name: "End-of-Line Belt — Sale", description: "Discontinued 35mm nylon belt in camo print. Matte buckle, adjustable. Limited sizes remain.", price: "18.00", category: "Sale", sku: "SL-007", stock: 20, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" },
  { name: "Sample Shorts 2-Pack — Sale", description: "Two-pack of overrun athletic shorts. Mixed colours, mesh lining. Elastic waistband with drawcord.", price: "38.00", category: "Sale", sku: "SL-008", stock: 14, imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?auto=format&fit=crop&q=80&w=800" },
];

async function seed() {
  console.log(`\n🌱  Starting seed — ${SEED_PRODUCTS.length} products across 13 categories\n`);

  let inserted = 0;
  let skipped = 0;

  for (const p of SEED_PRODUCTS) {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, p.sku))
      .limit(1);

    if (existing.length > 0) {
      // Update the imageUrl even if the SKU already exists (to fix broken images)
      await db
        .update(products)
        .set({ imageUrl: p.imageUrl })
        .where(eq(products.sku, p.sku));
      console.log(`  🔄  Update ${p.sku}  (${p.name}) — image refreshed`);
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

    console.log(`  ✅  ${p.sku}  ${p.category.padEnd(12)} — ${p.name}`);
    inserted++;
  }

  console.log(`\n✨  Done. ${inserted} inserted, ${skipped} updated/skipped.\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
