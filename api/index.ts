import express, { Request, Response } from "express";
const app = express();
app.get("/api/health", (_req: Request, res: Response) => res.json({ ok: true }));
export default app;
