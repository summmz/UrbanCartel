import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  index,
  foreignKey,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Product table for storing product information
 */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    imageUrl: text("imageUrl"),
    stock: int("stock").notNull().default(0),
    sku: varchar("sku", { length: 100 }).unique(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_category").on(table.category),
    index("idx_price").on(table.price),
    index("idx_isActive").on(table.isActive),
  ]
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Shopping cart table for storing user cart items
 */
export const cartItems = mysqlTable(
  "cartItems",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").notNull().default(1),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
    index("idx_userId").on(table.userId),
  ]
);

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders table for storing order information
 */
export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ])
      .default("pending")
      .notNull(),
    stripePaymentId: varchar("stripePaymentId", { length: 255 }),
    shippingAddress: text("shippingAddress"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    index("idx_userId").on(table.userId),
    index("idx_status").on(table.status),
  ]
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table for storing individual items in an order
 */
export const orderItems = mysqlTable(
  "orderItems",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").notNull(),
    priceAtPurchase: decimal("priceAtPurchase", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("restrict"),
    index("idx_orderId").on(table.orderId),
  ]
);

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Inventory table for tracking stock levels across warehouses
 */
export const inventory = mysqlTable(
  "inventory",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull().unique(),
    warehouseLocation: varchar("warehouseLocation", { length: 255 }),
    quantityOnHand: int("quantityOnHand").notNull().default(0),
    quantityReserved: int("quantityReserved").notNull().default(0),
    reorderLevel: int("reorderLevel").notNull().default(10),
    lastRestockDate: timestamp("lastRestockDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
  ]
);

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * Product reviews and ratings table
 */
export const reviews = mysqlTable(
  "reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    userId: int("userId").notNull(),
    rating: int("rating").notNull(), // 1-5 stars
    title: varchar("title", { length: 255 }),
    comment: text("comment"),
    isVerifiedPurchase: boolean("isVerifiedPurchase").default(false).notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("approved").notNull(),
    helpfulVotes: int("helpfulVotes").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    index("idx_productId").on(table.productId),
    index("idx_userId").on(table.userId),
  ]
);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * User shipping addresses table
 */
export const shippingAddresses = mysqlTable(
  "shippingAddresses",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    fullName: varchar("fullName", { length: 255 }).notNull(),
    street: varchar("street", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postalCode", { length: 20 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    phoneNumber: varchar("phoneNumber", { length: 20 }),
    isDefault: boolean("isDefault").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    index("idx_userId").on(table.userId),
  ]
);

export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type InsertShippingAddress = typeof shippingAddresses.$inferInsert;

/**
 * Notifications table for tracking sent notifications
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    type: mysqlEnum("type", [
      "order_confirmation",
      "shipping_update",
      "delivery_status",
      "low_stock_alert",
      "new_order_admin",
    ]).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    message: text("message").notNull(),
    recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
    isSent: boolean("isSent").default(false).notNull(),
    sentAt: timestamp("sentAt"),
    relatedOrderId: int("relatedOrderId"),
    relatedProductId: int("relatedProductId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("set null"),
    foreignKey({
      columns: [table.relatedOrderId],
      foreignColumns: [orders.id],
    }).onDelete("set null"),
    foreignKey({
      columns: [table.relatedProductId],
      foreignColumns: [products.id],
    }).onDelete("set null"),
    index("idx_userId").on(table.userId),
    index("idx_isSent").on(table.isSent),
  ]
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Payment transactions table for tracking all payment attempts
 */
export const payments = mysqlTable(
  "payments",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    userId: int("userId").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
    status: mysqlEnum("status", [
      "pending",
      "succeeded",
      "failed",
      "cancelled",
    ])
      .default("pending")
      .notNull(),
    paymentMethod: varchar("paymentMethod", { length: 50 }),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    index("idx_orderId").on(table.orderId),
    index("idx_status").on(table.status),
  ]
);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Returns table for tracking order return status
 */
export const returns = mysqlTable(
  "returns",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    userId: int("userId").notNull(),
    status: mysqlEnum("status", [
      "pending",
      "approved",
      "rejected",
      "received",
      "refunded",
    ])
      .default("pending")
      .notNull(),
    reason: text("reason").notNull(),
    totalRefundAmount: decimal("totalRefundAmount", { precision: 10, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    index("idx_orderId").on(table.orderId),
    index("idx_userId").on(table.userId),
    index("idx_status").on(table.status),
  ]
);

export type Return = typeof returns.$inferSelect;
export type InsertReturn = typeof returns.$inferInsert;

/**
 * Return items table for tracking individual items in a return
 */
export const returnItems = mysqlTable(
  "returnItems",
  {
    id: int("id").autoincrement().primaryKey(),
    returnId: int("returnId").notNull(),
    orderItemId: int("orderItemId").notNull(),
    quantity: int("quantity").notNull(),
    reason: text("reason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.returnId],
      foreignColumns: [returns.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.orderItemId],
      foreignColumns: [orderItems.id],
    }).onDelete("cascade"),
    index("idx_returnId").on(table.returnId),
  ]
);

export type ReturnItem = typeof returnItems.$inferSelect;
export type InsertReturnItem = typeof returnItems.$inferInsert;
