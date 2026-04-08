// @ts-nocheck
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { OAuth2Client } from 'google-auth-library';
import { ENV } from './env';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id');

/**
 * Local auth routes — replaces Manus OAuth for local development.
 * POST /api/auth/login  { name, email }  → sets session cookie, returns user
 * POST /api/auth/dev-login               → auto-login as admin (dev only)
 */
export function registerLocalAuthRoutes(app: Express) {
  // Login with name + email (creates user if not exists)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body as { name?: string; email?: string };
      if (!email) {
        res.status(400).json({ error: "email is required" });
        return;
      }

      const openId = `local_${email.replace(/[^a-zA-Z0-9]/g, "_")}`;

      await db.upsertUser({
        openId,
        name: name || email.split("@")[0],
        email,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name || email,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user });
    } catch (error) {
      console.error("[LocalAuth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Google OAuth Login
  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const { credential } = req.body;
      if (!credential) {
        res.status(400).json({ error: "credential is required" });
        return;
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        res.status(400).json({ error: "Invalid google credential" });
        return;
      }

      const openId = `google_${payload.sub}`;
      const role = (payload.email === ENV.ownerOpenId || payload.email === process.env.ADMIN_EMAIL) ? 'admin' : undefined;

      await db.upsertUser({
        openId,
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        loginMethod: "google",
        ...(role ? { role } : {}),
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name || payload.email,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user });
    } catch (error) {
      console.error("[LocalAuth] Google login failed", error);
      res.status(500).json({ error: "Google login failed" });
    }
  });

  // One-click admin login for development
  app.post("/api/auth/dev-login", async (req: Request, res: Response) => {
    try {
      const openId = "local_admin";

      await db.upsertUser({
        openId,
        name: "Admin",
        email: "admin@urbancartel.local",
        loginMethod: "local",
        lastSignedIn: new Date(),
      });

      // Promote to admin
      const dbInstance = await (db as any).getDb();
      if (dbInstance) {
        const { users } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await dbInstance.update(users).set({ role: "admin" }).where(eq(users.openId, openId));
      }

      const user = await db.getUserByOpenId(openId);
      if (!user) {
        res.status(500).json({ error: "Failed to create admin user" });
        return;
      }

      const sessionToken = await sdk.createSessionToken(openId, {
        name: "Admin",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user });
    } catch (error) {
      console.error("[LocalAuth] Dev login failed", error);
      res.status(500).json({ error: "Dev login failed" });
    }
  });
}
