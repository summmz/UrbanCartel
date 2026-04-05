import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: !!process.env.DATABASE_URL });
});

async function setupRoutes() {
  try {
    const { registerOAuthRoutes } = await import("../server/_core/oauth");
    registerOAuthRoutes(app);
  } catch (e: any) {
    console.error("OAuth routes failed:", e.message);
  }

  try {
    const { registerLocalAuthRoutes } = await import("../server/_core/localAuth");
    registerLocalAuthRoutes(app);
  } catch (e: any) {
    console.error("LocalAuth routes failed:", e.message);
  }

  try {
    const { appRouter } = await import("../server/routers");
    const { createContext } = await import("../server/_core/context");
    app.use(
      "/api/trpc",
      createExpressMiddleware({ router: appRouter, createContext })
    );
  } catch (e: any) {
    console.error("tRPC setup failed:", e.message);
    app.use("/api/trpc", (_req, res) => {
      res.status(500).json({ error: e.message });
    });
  }
}

setupRoutes();

export default app;
