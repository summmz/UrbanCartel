import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import * as db from "./db";
import { profileRouter } from "./routers-profile";
import { reviewsRouter } from "./routers-reviews";

// ============= VALIDATORS =============

const ProductFilterSchema = z.object({
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(10),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'default']).default('default'),
});

const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.string().min(1),
  category: z.string().min(1).max(100),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  imageUrl: z.string().optional(),
});

const UpdateProductSchema = CreateProductSchema.partial();

const AddToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
});

const UpdateCartItemSchema = z.object({
  cartItemId: z.number().int().positive(),
  quantity: z.number().int().min(0),
});

const CreateOrderSchema = z.object({
  shippingAddressId: z.number().int().positive(),
  paymentMethod: z.enum(["mock_card", "cod"]).default("mock_card"),
});

const UpdateOrderStatusSchema = z.object({
  orderId: z.number().int().positive(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

const CreateReviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

const ShippingAddressSchema = z.object({
  fullName: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phoneNumber: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// ============= ADMIN PROCEDURE =============

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

// ============= ROUTERS =============

export const appRouter = router({
  system: systemRouter,
  profile: profileRouter,
  reviews: reviewsRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= PRODUCT ROUTES =============

  products: router({
    list: publicProcedure.input(ProductFilterSchema).query(async ({ input }) => {
      const products = await db.getProducts(
        input.page,
        input.limit,
        input.category,
        input.minPrice,
        input.maxPrice,
        input.search,
        input.sort
      );
      return products.items;
    }),

    getById: publicProcedure.input(z.number().int().positive()).query(async ({ input }) => {
      const product = await db.getProductById(input);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }
      return product;
    }),

    categories: publicProcedure.query(async () => {
      return db.getCategories();
    }),

    create: adminProcedure.input(CreateProductSchema).mutation(async ({ input }) => {
      const result = await db.createProduct({
        name: input.name,
        description: input.description,
        price: input.price,
        category: input.category,
        stock: input.stock,
        sku: input.sku,
        imageUrl: input.imageUrl,
        isActive: true,
      });

      // Drizzle ORM returns [ResultSetHeader, undefined] for mysql2
      const productId = (result as any)[0].insertId;

      // Create inventory record
      await db.createInventory(productId, input.stock);

      return { id: productId, ...input };
    }),

    update: adminProcedure
      .input(z.object({ id: z.number().int().positive(), ...UpdateProductSchema.shape }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const product = await db.updateProduct(id, updates);
        return product;
      }),

    delete: adminProcedure.input(z.number().int().positive()).mutation(async ({ input }) => {
      await db.deleteProduct(input);
      return { success: true };
    }),
  }),

  // ============= CART ROUTES =============

  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);

      // Enrich with product details
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const product = await db.getProductById(item.productId);
          return {
            ...item,
            product,
          };
        })
      );

      return enrichedItems;
    }),

    add: protectedProcedure.input(AddToCartSchema).mutation(async ({ ctx, input }) => {
      const product = await db.getProductById(input.productId);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Bug 5 fix: check stock before adding to cart
      if (product.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Only ${product.stock} unit(s) available`,
        });
      }
      await db.addToCart(ctx.user.id, input.productId, input.quantity);
      return { success: true };
    }),

    update: protectedProcedure.input(UpdateCartItemSchema).mutation(async ({ ctx, input }) => {
      const items = await db.getCartItems(ctx.user.id);
      const item = items.find((i) => i.id === input.cartItemId);
      if (!item) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cart item not found or access denied" });
      }
      await db.updateCartItem(input.cartItemId, input.quantity);
      return { success: true };
    }),

    remove: protectedProcedure.input(z.number().int().positive()).mutation(async ({ ctx, input }) => {
      const items = await db.getCartItems(ctx.user.id);
      const item = items.find((i) => i.id === input);
      if (!item) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cart item not found or access denied" });
      }
      await db.removeFromCart(input);
      return { success: true };
    }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ============= ORDER ROUTES =============

  orders: router({
    list: protectedProcedure
      .input(z.object({ page: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(100).default(10) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role === "admin") {
          return db.getAllOrders(input.page, input.limit);
        }
        return db.getUserOrders(ctx.user.id, input.page, input.limit);
      }),

    getById: protectedProcedure.input(z.number().int().positive()).query(async ({ ctx, input }) => {
      const order = await db.getOrderById(input);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check authorization
      if (ctx.user.role !== "admin" && order.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this order",
        });
      }

      const items = await db.getOrderItems(input);
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const product = await db.getProductById(item.productId);
          return {
            ...item,
            product,
          };
        })
      );

      let parsedShippingAddress = order.shippingAddress;
      if (typeof order.shippingAddress === 'string') {
        try {
          parsedShippingAddress = JSON.parse(order.shippingAddress);
        } catch (e) {
          console.error("Failed to parse shipping address string", e);
        }
      }

      return { ...order, shippingAddress: parsedShippingAddress, items: enrichedItems };
    }),

    create: protectedProcedure.input(CreateOrderSchema).mutation(async ({ ctx, input }) => {
      // Get cart items
      const cartItems = await db.getCartItems(ctx.user.id);
      if (cartItems.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      // Get shipping address
      const addresses = await db.getUserShippingAddresses(ctx.user.id);
      const address = addresses.find((a) => a.id === input.shippingAddressId);
      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shipping address not found",
        });
      }

      // Calculate total
      let totalPrice = 0;
      const orderItems = [];

      for (const item of cartItems) {
        const product = await db.getProductById(item.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product ${item.productId} not found`,
          });
        }

        // Bug 5 fix: check stock availability before placing order
        if (product.stock < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
          });
        }

        const itemTotal = parseFloat(product.price) * item.quantity;
        totalPrice += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        });
      }

      const tax = totalPrice * 0.1;
      let finalTotal = totalPrice + tax;
      
      if (input.paymentMethod === "cod") {
        const COD_FEE_USD = 29 / 84;
        finalTotal += COD_FEE_USD;
      }

      // Create order
      const shippingAddressStr = JSON.stringify({
        fullName: address.fullName,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phoneNumber: address.phoneNumber,
      });

      const orderResult = await db.createOrder(
        ctx.user.id,
        finalTotal,
        shippingAddressStr,
        `mock_${Date.now()}` // Mock payment gateway ID
      );

      const orderId = (orderResult as any)[0].insertId;

      // Add order items
      await db.addOrderItems(
        orderId,
        orderItems.map((item) => ({
          orderId,
          ...item,
        }))
      );

      // Bug 4 fix: decrement stock for each ordered item
      for (const item of orderItems) {
        await db.decrementProductStock(item.productId, item.quantity);
      }

      // Clear cart
      await db.clearCart(ctx.user.id);

      // Create payment record
      await db.createPayment({
        orderId,
        userId: ctx.user.id,
        amount: finalTotal.toString(),
        currency: "USD",
        stripePaymentIntentId: `mock_${Date.now()}`,
        status: input.paymentMethod === "mock_card" ? "succeeded" : "pending",
        paymentMethod: input.paymentMethod,
      });

      // Notify admin of new order (fire-and-forget)
      notifyOwner({
        title: `New order #${orderId}`,
        content: `A new order has been placed for $${totalPrice.toFixed(2)} (${orderItems.length} item${orderItems.length !== 1 ? "s" : ""}). Order ID: ${orderId}`,
      }).catch(() => { }); // swallow errors – non-critical

      // Check for low stock and notify admin
      for (const item of orderItems) {
        const product = await db.getProductById(item.productId);
        if (product && product.stock <= 5) {
          notifyOwner({
            title: `Low stock alert: ${product.name}`,
            content: `Stock for "${product.name}" (ID: ${product.id}) has dropped to ${product.stock} unit${product.stock !== 1 ? "s" : ""}. Consider restocking soon.`,
          }).catch(() => { });
        }
      }

      return { id: orderId, totalPrice, status: "pending" };
    }),

    updateStatus: adminProcedure.input(UpdateOrderStatusSchema).mutation(async ({ input }) => {
      const order = await db.updateOrderStatus(input.orderId, input.status);
      return order;
    }),
  }),



  // ============= SHIPPING ADDRESSES ROUTES =============

  shippingAddresses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserShippingAddresses(ctx.user.id);
    }),

    create: protectedProcedure.input(ShippingAddressSchema).mutation(async ({ ctx, input }) => {
      await db.createShippingAddress({
        userId: ctx.user.id,
        ...input,
      });
      return { success: true };
    }),

    update: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), ...ShippingAddressSchema.partial().shape }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        const addresses = await db.getUserShippingAddresses(ctx.user.id);
        const address = addresses.find((a) => a.id === id);
        if (!address) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Address not found or access denied" });
        }
        await db.updateShippingAddress(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure.input(z.number().int().positive()).mutation(async ({ ctx, input }) => {
      const addresses = await db.getUserShippingAddresses(ctx.user.id);
      const address = addresses.find((a) => a.id === input);
      if (!address) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Address not found or access denied" });
      }
      await db.deleteShippingAddress(input);
      return { success: true };
    }),
  }),

  // ============= RETURNS ROUTES =============

  returns: router({
    create: protectedProcedure
      .input(z.object({
        orderId: z.number().int().positive(),
        reason: z.string().min(5),
        items: z.array(z.object({
          orderItemId: z.number().int().positive(),
          quantity: z.number().int().positive(),
          reason: z.string().optional(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const returnId = await db.createReturn(userId, input.orderId, input.reason, input.items);
        return { returnId };
      }),

    listMy: protectedProcedure
      .input(z.object({ page: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(50).default(10) }))
      .query(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        return await db.getUserReturns(userId, input.page, input.limit);
      }),

    getById: protectedProcedure
      .input(z.number().int().positive())
      .query(async ({ ctx, input }) => {
        const returnData = await db.getReturnById(input);
        if (!returnData) throw new TRPCError({ code: "NOT_FOUND", message: "Return not found" });

        // Authorization check (unless admin)
        if (ctx.user.role !== "admin" && returnData.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this return" });
        }

        return returnData;
      }),

    adminListAll: adminProcedure
      .input(z.object({ page: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(50).default(20) }))
      .query(async ({ input }) => {
        return await db.getAllReturns(input.page, input.limit);
      }),

    adminUpdateStatus: adminProcedure
      .input(z.object({
        returnId: z.number().int().positive(),
        status: z.enum(["pending", "approved", "rejected", "received", "refunded"]),
        totalRefundAmount: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateReturnStatus(input.returnId, input.status, input.totalRefundAmount);
      }),
  }),

  // ============= INVENTORY ROUTES =============

  inventory: router({
    getByProduct: adminProcedure.input(z.number().int().positive()).query(async ({ input }) => {
      return db.getInventory(input);
    }),

    getLowStock: adminProcedure.query(async () => {
      return db.getLowStockProducts(10);
    }),

    update: adminProcedure
      .input(
        z.object({
          productId: z.number().int().positive(),
          quantityOnHand: z.number().int().min(0).optional(),
          quantityReserved: z.number().int().min(0).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateInventory(input.productId, input.quantityOnHand, input.quantityReserved);
        return { success: true };
      }),
  }),

  // ============= PAYMENTS ROUTES =============

  payments: router({
    getByStripeId: adminProcedure.input(z.string()).query(async ({ input }) => {
      return db.getPaymentByStripeId(input);
    }),

    updateStatus: adminProcedure
      .input(z.object({ paymentId: z.number().int().positive(), status: z.string() }))
      .mutation(async ({ input }) => {
        await db.updatePaymentStatus(input.paymentId, input.status);
        return { success: true };
      }),
  }),

  // ============= ANALYTICS ROUTES =============

  analytics: router({
    dashboard: adminProcedure.query(async () => {
      return db.getDashboardStats();
    }),

    revenueByDay: adminProcedure
      .input(z.object({ days: z.number().int().min(7).max(365).default(30) }))
      .query(async ({ input }) => {
        return db.getRevenueByDay(input.days);
      }),

    ordersByStatus: adminProcedure.query(async () => {
      return db.getOrdersByStatus();
    }),

    topProducts: adminProcedure
      .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }))
      .query(async ({ input }) => {
        return db.getTopProducts(input.limit);
      }),
  }),

  // ============= USER MANAGEMENT ROUTES =============

  users: router({
    list: adminProcedure
      .input(z.object({ page: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(100).default(20) }))
      .query(async ({ input }) => {
        return db.getAllUsers(input.page, input.limit);
      }),

    updateRole: adminProcedure
      .input(z.object({ userId: z.number().int().positive(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ ctx, input }) => {
        // Prevent self-demotion
        if (input.userId === ctx.user.id && input.role !== "admin") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot remove your own admin role" });
        }
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
