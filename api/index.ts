import express from "express";
const app = express();
app.get("/api/health", (req, res) => {
  res.send(JSON.stringify({ ok: true }));
});
export default app;
