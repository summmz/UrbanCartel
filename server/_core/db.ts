// @ts-nocheck
import { eq, and, gte, lte, like, desc, asc, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  products,
  cartItems,
  orders,
  orderItems,
  inventory,
  reviews,
  shippingAddresses,
  notifications,
  payments,
  Product,
  CartItem,
  Order,
  OrderItem,
  Inventory,
  Review,
  ShippingAddress,
  Notification,
  Payment,
  Return,
  ReturnItem,
  returns,
  returnItems,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER QUERIES =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= PRODUCT QUERIES =============

export async function getProducts(
  page: number = 0,
  limit: number = 10,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  search?: string,
  sort: 'newest' | 'price_asc' | 'price_desc' | 'default' = 'default'
) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [eq(products.isActive, true)];
  
  if (category) {
    conditions.push(eq(products.category, category));
  }
  
  if (minPrice !== undefined) {
    conditions.push(gte(products.price, minPrice.toString()));
  }
  
  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, maxPrice.toString()));
  }
  
  if (search) {
    conditions.push(like(products.name, `%${search}%`));
  }

  const order = sort === 'newest'
    ? desc(products.createdAt)
    : sort === 'price_asc'
    ? asc(products.price)
    : sort === 'price_desc'
    ? desc(products.price)
    : products.id;

  const items = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(order)
    .limit(limit)
    .offset(page * limit);

  return { items };
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values(product);
  return result;
}

export async function updateProduct(productId: number, updates: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(products).set(updates).where(eq(products.id, productId));
  return getProductById(productId);
}

export async function deleteProduct(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // We perform a SOFT DELETE to avoid breaking order history if the product has been sold.
  // The isActive: false flag makes it disappear from the storefront and admin lists.
  await db.update(products).set({ isActive: false }).where(eq(products.id, productId));
}


export async function decrementProductStock(productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Decrement products.stock, floor at 0
  await db.execute(
    sql`UPDATE products SET stock = GREATEST(0, stock - ${quantity}) WHERE id = ${productId}`
  );

  // Also decrement inventory.quantityOnHand
  await db.execute(
    sql`UPDATE inventory SET quantityOnHand = GREATEST(0, quantityOnHand - ${quantity}) WHERE productId = ${productId}`
  );
}

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.isActive, true));

  return result.map(r => r.category);
}

// ============= CART QUERIES =============

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(cartItems)
    .where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: number, productId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
  }
}

export async function removeFromCart(cartItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ============= ORDER QUERIES =============

export async function createOrder(
  userId: number,
  totalPrice: number,
  shippingAddress: string,
  stripePaymentId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values({
    userId,
    totalPrice: totalPrice.toString(),
    shippingAddress,
    stripePaymentId,
    status: "pending",
  });

  return result;
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number, page: number = 0, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(page * limit);
}

export async function getAllOrders(page: number = 0, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(page * limit);
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
  return getOrderById(orderId);
}

// ============= ORDER ITEMS QUERIES =============

export async function addOrderItems(orderId: number, items: typeof orderItems.$inferInsert[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(orderItems).values(items);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
}

// ============= INVENTORY QUERIES =============

export async function getInventory(productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(inventory)
    .where(eq(inventory.productId, productId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createInventory(productId: number, quantityOnHand: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(inventory).values({
    productId: productId,
    quantityOnHand: quantityOnHand,
    quantityReserved: 0,
    reorderLevel: 10,
  });
}

export async function updateInventory(
  productId: number,
  quantityOnHand?: number,
  quantityReserved?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: Record<string, any> = {};
  if (quantityOnHand !== undefined) updates.quantityOnHand = quantityOnHand;
  if (quantityReserved !== undefined) updates.quantityReserved = quantityReserved;

  await db.update(inventory).set(updates).where(eq(inventory.productId, productId));
}

export async function getLowStockProducts(threshold: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(inventory)
    .where(lte(inventory.quantityOnHand, threshold));
}

// ============= REVIEW QUERIES =============

export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

export async function createReview(
  productId: number,
  userId: number,
  rating: number,
  title?: string,
  comment?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(reviews).values({
    productId,
    userId,
    rating,
    title,
    comment,
    isVerifiedPurchase: false,
  });
}

// ============= SHIPPING ADDRESS QUERIES =============

export async function getUserShippingAddresses(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(shippingAddresses)
    .where(eq(shippingAddresses.userId, userId));
}

export async function createShippingAddress(address: typeof shippingAddresses.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(shippingAddresses).values(address);
}

export async function updateShippingAddress(
  addressId: number,
  updates: Partial<typeof shippingAddresses.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(shippingAddresses).set(updates).where(eq(shippingAddresses.id, addressId));
}

export async function deleteShippingAddress(addressId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(shippingAddresses).where(eq(shippingAddresses.id, addressId));
}

// ============= NOTIFICATION QUERIES =============

export async function createNotification(notification: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notifications).values(notification);
}

export async function getPendingNotifications() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.isSent, false));
}

export async function markNotificationAsSent(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ isSent: true, sentAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

// ============= PAYMENT QUERIES =============

export async function createPayment(payment: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(payment);
  return result;
}

export async function getPaymentByStripeId(stripePaymentIntentId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(paymentId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments).set({ status: status as any }).where(eq(payments.id, paymentId));
}

export async function getOrderPayment(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= ANALYTICS QUERIES =============

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0 };

  const [revenueResult, orderResult, userResult, productResult] = await Promise.all([
    db.select({ total: sql<number>`coalesce(sum(totalPrice), 0)` }).from(orders),
    db.select({ total: sql<number>`count(*)` }).from(orders),
    db.select({ total: sql<number>`count(*)` }).from(users),
    db.select({ total: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true)),
  ]);

  return {
    totalRevenue: Number(revenueResult[0]?.total) || 0,
    totalOrders: Number(orderResult[0]?.total) || 0,
    totalUsers: Number(userResult[0]?.total) || 0,
    totalProducts: Number(productResult[0]?.total) || 0,
  };
}

export async function getRevenueByDay(days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await db
    .select({
      date: sql<string>`DATE(createdAt)`,
      revenue: sql<number>`coalesce(sum(totalPrice), 0)`,
      orderCount: sql<number>`count(*)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, since))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);

  return result.map((r) => ({
    date: String(r.date),
    revenue: Number(r.revenue),
    orderCount: Number(r.orderCount),
  }));
}

export async function getOrdersByStatus() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .groupBy(orders.status);

  return result.map((r) => ({ status: r.status, count: Number(r.count) }));
}

export async function getTopProducts(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      productId: orderItems.productId,
      name: products.name,
      totalSold: sql<number>`sum(${orderItems.quantity})`,
      revenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.priceAtPurchase})`,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .groupBy(orderItems.productId, products.name)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(limit);

  return result.map((r) => ({
    productId: r.productId,
    name: r.name,
    totalSold: Number(r.totalSold),
    revenue: Number(r.revenue),
  }));
}

// ============= USER MANAGEMENT QUERIES =============

export async function getAllUsers(page: number = 0, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(page * limit);
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============= RETURN QUERIES =============

export async function createReturn(
  userId: number,
  orderId: number,
  reason: string,
  items: { orderItemId: number; quantity: number; reason?: string }[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.transaction(async (tx) => {
    // 1. Create the main return record
    const [returnRecord] = await tx.insert(returns).values({
      userId,
      orderId,
      reason,
      status: "pending",
    }) as any;

    const returnId = returnRecord.insertId;

    // 2. Create the individual return items
    if (items.length > 0) {
      const returnItemsValues = items.map((item) => ({
        returnId,
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        reason: item.reason || reason,
      }));
      await tx.insert(returnItems).values(returnItemsValues);
    }

    return returnId;
  });
}

export async function getReturnById(returnId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(returns)
    .where(eq(returns.id, returnId))
    .limit(1);

  if (result.length === 0) return undefined;

  const items = await db
    .select()
    .from(returnItems)
    .where(eq(returnItems.returnId, returnId));

  return { ...result[0], items };
}

export async function getUserReturns(userId: number, page: number = 0, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(returns)
    .where(eq(returns.userId, userId))
    .orderBy(desc(returns.createdAt))
    .limit(limit)
    .offset(page * limit);
}

export async function getAllReturns(page: number = 0, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(returns)
    .orderBy(desc(returns.createdAt))
    .limit(limit)
    .offset(page * limit);
}

export async function updateReturnStatus(returnId: number, status: string, totalRefundAmount?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: any = { status };
  if (totalRefundAmount !== undefined) updates.totalRefundAmount = totalRefundAmount;

  await db.update(returns).set(updates).where(eq(returns.id, returnId));
  return getReturnById(returnId);
}
