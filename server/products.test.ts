import { describe, it, expect, beforeAll, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user contexts
const createMockContext = (role: "user" | "admin" = "user"): TrpcContext => ({
  user: {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("Product Routes", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext("user");
    caller = appRouter.createCaller(ctx);
  });

  describe("products.list", () => {
    it("should return a list of products", async () => {
      const result = await caller.products.list({
        page: 0,
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should support pagination parameters", async () => {
      const result = await caller.products.list({
        page: 0,
        limit: 5,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it("should support category filtering", async () => {
      const result = await caller.products.list({
        page: 0,
        limit: 10,
        category: "Electronics",
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should support price range filtering", async () => {
      const result = await caller.products.list({
        page: 0,
        limit: 10,
        minPrice: 10,
        maxPrice: 100,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should support search by name", async () => {
      const result = await caller.products.list({
        page: 0,
        limit: 10,
        search: "product",
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("products.categories", () => {
    it("should return list of categories", async () => {
      const result = await caller.products.categories();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("products.create (admin only)", () => {
    it("should reject non-admin users", async () => {
      const userCtx = createMockContext("user");
      const userCaller = appRouter.createCaller(userCtx);

      try {
        await userCaller.products.create({
          name: "Test Product",
          price: "29.99",
          category: "Test",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin to create product", async () => {
      const adminCtx = createMockContext("admin");
      const adminCaller = appRouter.createCaller(adminCtx);

      const result = await adminCaller.products.create({
        name: `Test Product ${Date.now()}`,
        description: "A test product",
        price: "29.99",
        category: "Test",
        stock: 10,
        sku: `TEST-${Date.now()}`,
      });

      expect(result).toBeDefined();
      expect(result.name).toContain("Test Product");
    });
  });
});

describe("Cart Routes", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext("user");
    caller = appRouter.createCaller(ctx);
  });

  describe("cart.list", () => {
    it("should return user's cart items", async () => {
      const result = await caller.cart.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("cart.clear", () => {
    it("should clear user's cart", async () => {
      const result = await caller.cart.clear();

      expect(result.success).toBe(true);
    });
  });
});

describe("Order Routes", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext("user");
    caller = appRouter.createCaller(ctx);
  });

  describe("orders.list", () => {
    it("should return user's orders", async () => {
      const result = await caller.orders.list({
        page: 0,
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("orders.create", () => {
    it("should reject if cart is empty", async () => {
      try {
        await caller.orders.create({
          shippingAddressId: 1,
        });
        expect.fail("Should have thrown BAD_REQUEST error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });
});

describe("Review Routes", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext("user");
    caller = appRouter.createCaller(ctx);
  });

  describe("reviews.getByProduct", () => {
    it("should return paginated reviews for a product", async () => {
      const result = await caller.reviews.getByProduct({
        productId: 1,
        page: 0,
        limit: 10,
        sortBy: "recent",
      });

      expect(result).toHaveProperty("reviews");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("hasMore");
      expect(Array.isArray(result.reviews)).toBe(true);
    });

    it("should support sortBy options", async () => {
      for (const sortBy of ["recent", "highest", "lowest", "helpful"] as const) {
        const result = await caller.reviews.getByProduct({
          productId: 1,
          page: 0,
          limit: 5,
          sortBy,
        });
        expect(Array.isArray(result.reviews)).toBe(true);
      }
    });

    it("should support rating filter", async () => {
      const result = await caller.reviews.getByProduct({
        productId: 1,
        page: 0,
        limit: 10,
        sortBy: "recent",
        filterRating: 5,
      });
      expect(Array.isArray(result.reviews)).toBe(true);
      result.reviews.forEach((r) => expect(r.rating).toBe(5));
    });
  });

  describe("reviews.getStats", () => {
    it("should return rating stats for a product", async () => {
      const result = await caller.reviews.getStats(1);

      expect(result).toHaveProperty("averageRating");
      expect(result).toHaveProperty("totalReviews");
      expect(result).toHaveProperty("ratingDistribution");
      expect(result).toHaveProperty("percentByRating");
      expect(typeof result.averageRating).toBe("number");
      expect(typeof result.totalReviews).toBe("number");
    });
  });

  describe("reviews.create", () => {
    it("should reject rating below 1", async () => {
      try {
        await caller.reviews.create({ productId: 1, rating: 0 });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should reject rating above 5", async () => {
      try {
        await caller.reviews.create({ productId: 1, rating: 10 });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("reviews.adminList (admin only)", () => {
    it("should reject non-admin users", async () => {
      try {
        await caller.reviews.adminList({ page: 0, limit: 20 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should return paginated reviews for admins", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      const result = await adminCaller.reviews.adminList({ page: 0, limit: 20 });

      expect(result).toHaveProperty("reviews");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.reviews)).toBe(true);
    });

    it("should support status filter", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      for (const status of ["pending", "approved", "rejected"] as const) {
        const result = await adminCaller.reviews.adminList({ page: 0, limit: 20, status });
        expect(Array.isArray(result.reviews)).toBe(true);
      }
    });
  });

  describe("reviews.moderate (admin only)", () => {
    it("should reject non-admin users", async () => {
      try {
        await caller.reviews.moderate({ id: 1, status: "approved" });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});

describe("Shipping Address Routes", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext("user");
    caller = appRouter.createCaller(ctx);
  });

  describe("shippingAddresses.list", () => {
    it("should return user's shipping addresses", async () => {
      const result = await caller.shippingAddresses.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("shippingAddresses.create", () => {
    it("should create a new shipping address", async () => {
      const result = await caller.shippingAddresses.create({
        fullName: "John Doe",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
        phoneNumber: "555-1234",
        isDefault: false,
      });

      expect(result.success).toBe(true);
    });
  });
});

describe("Admin-Only Routes", () => {
  describe("inventory.getLowStock", () => {
    it("should reject non-admin users", async () => {
      const userCtx = createMockContext("user");
      const userCaller = appRouter.createCaller(userCtx);

      try {
        await userCaller.inventory.getLowStock();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should return low stock items for admins", async () => {
      const adminCtx = createMockContext("admin");
      const adminCaller = appRouter.createCaller(adminCtx);

      const result = await adminCaller.inventory.getLowStock();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("orders.updateStatus", () => {
    it("should reject non-admin users", async () => {
      const userCtx = createMockContext("user");
      const userCaller = appRouter.createCaller(userCtx);

      try {
        await userCaller.orders.updateStatus({
          orderId: 1,
          status: "shipped",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("products.delete", () => {
    it("should reject non-admin users", async () => {
      const userCtx = createMockContext("user");
      const userCaller = appRouter.createCaller(userCtx);

      try {
        await userCaller.products.delete(1);
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});

describe("Authentication", () => {
  describe("auth.me", () => {
    it("should return current user info", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.role).toBe("user");
    });

    it("should return admin info for admin users", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.role).toBe("admin");
    });
  });

  describe("auth.logout", () => {
    it("should clear session cookie", async () => {
      const ctx = createMockContext("user");
      const clearedCookies: any[] = [];

      ctx.res = {
        clearCookie: (name: string, options: any) => {
          clearedCookies.push({ name, options });
        },
      } as any;

      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();

      expect(result.success).toBe(true);
      expect(clearedCookies.length).toBeGreaterThan(0);
    });
  });
});

describe("Analytics Routes (admin only)", () => {
  describe("analytics.dashboard", () => {
    it("should reject non-admin users", async () => {
      const userCaller = appRouter.createCaller(createMockContext("user"));
      try {
        await userCaller.analytics.dashboard();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should return dashboard stats for admins", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      const result = await adminCaller.analytics.dashboard();

      expect(result).toHaveProperty("totalRevenue");
      expect(result).toHaveProperty("totalOrders");
      expect(result).toHaveProperty("totalUsers");
      expect(result).toHaveProperty("totalProducts");
      expect(typeof result.totalRevenue).toBe("number");
      expect(typeof result.totalOrders).toBe("number");
    });
  });

  describe("analytics.revenueByDay", () => {
    it("should reject non-admin users", async () => {
      const userCaller = appRouter.createCaller(createMockContext("user"));
      try {
        await userCaller.analytics.revenueByDay({ days: 30 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should return revenue data array for admins", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      const result = await adminCaller.analytics.revenueByDay({ days: 30 });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((row) => {
        expect(row).toHaveProperty("date");
        expect(row).toHaveProperty("revenue");
        expect(row).toHaveProperty("orderCount");
      });
    });

    it("should reject invalid days range", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      try {
        await adminCaller.analytics.revenueByDay({ days: 1 }); // below min of 7
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("analytics.ordersByStatus", () => {
    it("should return status breakdown for admins", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      const result = await adminCaller.analytics.ordersByStatus();

      expect(Array.isArray(result)).toBe(true);
      result.forEach((row) => {
        expect(row).toHaveProperty("status");
        expect(row).toHaveProperty("count");
      });
    });
  });

  describe("analytics.topProducts", () => {
    it("should return top products for admins", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      const result = await adminCaller.analytics.topProducts({ limit: 5 });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((p) => {
        expect(p).toHaveProperty("productId");
        expect(p).toHaveProperty("name");
        expect(p).toHaveProperty("totalSold");
        expect(p).toHaveProperty("revenue");
      });
    });
  });
});

describe("User Management Routes (admin only)", () => {
  describe("users.list", () => {
    it("should reject non-admin users", async () => {
      const userCaller = appRouter.createCaller(createMockContext("user"));
      try {
        await userCaller.users.list({ page: 0, limit: 20 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should return user list for admins", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin"));
      const result = await adminCaller.users.list({ page: 0, limit: 20 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("users.updateRole", () => {
    it("should reject non-admin users", async () => {
      const userCaller = appRouter.createCaller(createMockContext("user"));
      try {
        await userCaller.users.updateRole({ userId: 2, role: "admin" });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should prevent admin from removing their own admin role", async () => {
      const adminCaller = appRouter.createCaller(createMockContext("admin")); // id=1
      try {
        await adminCaller.users.updateRole({ userId: 1, role: "user" });
        expect.fail("Should have thrown BAD_REQUEST error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });
});

describe("Profile Routes", () => {
  describe("profile.get", () => {
    it("should return profile for authenticated user", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);
      const result = await caller.profile.get();

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
    });
  });
});
