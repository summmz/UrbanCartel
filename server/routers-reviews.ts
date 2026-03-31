import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { reviews, products, orderItems, orders } from "../drizzle/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

/**
 * Enhanced reviews router with aggregation, filtering, sorting, and moderation
 */
export const reviewsRouter = router({
  /**
   * Get reviews for a product with aggregated rating data
   */
  getByProduct: publicProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        page: z.number().int().min(0).default(0),
        limit: z.number().int().min(1).max(50).default(10),
        sortBy: z.enum(["recent", "highest", "lowest", "helpful"]).default("recent"),
        filterRating: z.number().int().min(1).max(5).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify product exists
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product || product.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Build query with filters - only show approved reviews to public
      let whereCondition: any = and(
        eq(reviews.productId, input.productId),
        eq(reviews.status, "approved")
      );

      // Apply rating filter if specified
      if (input.filterRating) {
        whereCondition = and(whereCondition, eq(reviews.rating, input.filterRating));
      }

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(whereCondition);

      const total = Number(countResult[0]?.count) || 0;

      // Apply pagination and sorting
      const offset = input.page * input.limit;
      
      let orderBy;
      switch (input.sortBy) {
        case "recent":
          orderBy = desc(reviews.createdAt);
          break;
        case "highest":
          orderBy = desc(reviews.rating);
          break;
        case "lowest":
          orderBy = asc(reviews.rating);
          break;
        case "helpful":
          orderBy = desc(reviews.helpfulVotes);
          break;
        default:
          orderBy = desc(reviews.createdAt);
      }

      const reviewsList = await db
        .select()
        .from(reviews)
        .where(whereCondition)
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(offset);

      return {
        reviews: reviewsList,
        total,
        page: input.page,
        limit: input.limit,
        hasMore: offset + input.limit < total,
      };
    }),

  /**
   * Get aggregated rating statistics for a product
   */
  getStats: publicProcedure.input(z.number().int().positive()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Bug 6 fix: use SQL aggregation instead of fetching all rows into memory
    const aggResult = await db
      .select({
        total: sql<number>`count(*)`,
        avg: sql<number>`avg(rating)`,
        r5: sql<number>`sum(case when rating = 5 then 1 else 0 end)`,
        r4: sql<number>`sum(case when rating = 4 then 1 else 0 end)`,
        r3: sql<number>`sum(case when rating = 3 then 1 else 0 end)`,
        r2: sql<number>`sum(case when rating = 2 then 1 else 0 end)`,
        r1: sql<number>`sum(case when rating = 1 then 1 else 0 end)`,
      })
      .from(reviews)
      .where(and(eq(reviews.productId, input), eq(reviews.status, "approved")));

    // Bug 7 fix: MySQL COUNT/SUM return strings — coerce to number
    const row = aggResult[0];
    const totalReviews = Number(row?.total) || 0;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentByRating: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const averageRating = parseFloat((Number(row.avg) || 0).toFixed(1));
    const ratingDistribution = {
      5: Number(row.r5) || 0,
      4: Number(row.r4) || 0,
      3: Number(row.r3) || 0,
      2: Number(row.r2) || 0,
      1: Number(row.r1) || 0,
    };
    const percentByRating = {
      5: Math.round((ratingDistribution[5] / totalReviews) * 100),
      4: Math.round((ratingDistribution[4] / totalReviews) * 100),
      3: Math.round((ratingDistribution[3] / totalReviews) * 100),
      2: Math.round((ratingDistribution[2] / totalReviews) * 100),
      1: Math.round((ratingDistribution[1] / totalReviews) * 100),
    };

    return { averageRating, totalReviews, ratingDistribution, percentByRating };
  }),

  /**
   * Create a new review
   */
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        rating: z.number().int().min(1).max(5),
        title: z.string().min(3).max(100).optional(),
        comment: z.string().min(10).max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify product exists
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product || product.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if user already reviewed this product
      const existingReview = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productId, input.productId), eq(reviews.userId, ctx.user.id)));
      
      if (existingReview.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reviewed this product",
        });
      }

      // Check for verified purchase
      const purchase = await db
        .select()
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(
          eq(orders.userId, ctx.user.id),
          eq(orderItems.productId, input.productId),
          eq(orders.status, "delivered")
        ))
        .limit(1);

      const isVerifiedPurchase = purchase.length > 0;

      // Create review (default status approved for now, but could be pending)
      await db.insert(reviews).values({
        productId: input.productId,
        userId: ctx.user.id,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isVerifiedPurchase,
        status: "approved", 
        helpfulVotes: 0,
      });

      return { success: true, message: "Review created successfully" };
    }),

  /**
   * Vote a review as helpful
   */
  voteHelpful: protectedProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Bug 8 fix: prevent users from voting on their own review
      const review = await db.select().from(reviews).where(eq(reviews.id, input)).limit(1);
      if (!review || review.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
      }
      if (review[0].userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot vote on your own review" });
      }

      await db
        .update(reviews)
        .set({ helpfulVotes: sql`helpfulVotes + 1` })
        .where(eq(reviews.id, input));

      return { success: true };
    }),

  /**
   * Admin: List all reviews for moderation
   */
  adminList: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(0).default(0),
        limit: z.number().int().min(1).max(50).default(20),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = input.page * input.limit;
      let whereCondition = input.status ? eq(reviews.status, input.status) : undefined;

      const reviewsList = await db
        .select()
        .from(reviews)
        .where(whereCondition)
        .orderBy(desc(reviews.createdAt))
        .limit(input.limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(whereCondition);

      const total = Number(countResult[0]?.count) || 0;

      return {
        reviews: reviewsList,
        total,
        page: input.page,
        limit: input.limit,
        hasMore: offset + input.limit < total,
      };
    }),

  /**
   * Admin: Update review status (moderate)
   */
  moderate: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["approved", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(reviews)
        .set({ status: input.status })
        .where(eq(reviews.id, input.id));

      return { success: true };
    }),
});
