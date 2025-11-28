// backend/src/server.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import deviceRoutes from "./routes/devices.js";
import analyticsRoutes from "./routes/analytics.js";
import alertRoutes from "./routes/alerts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Reasonable defaults for local dev (Vite, localhost IP variants)
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
];

// CORS configuration
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowList = new Set([...(CORS_ORIGINS.length ? CORS_ORIGINS : DEFAULT_ORIGINS)]);
      if (!origin) return callback(null, true); // non-browser or same-origin
      if (allowList.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

app.use("/uploads", express.static(uploadsDir));
app.use(express.json());

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Bandipur Watch Nexus API is running 🚀",
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/devices", deviceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/alerts", alertRoutes);

// 404 handler - catch-all
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handler
app.use(
  (err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error("Server error:", err);
    const message =
      process.env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : "Something went wrong";
    res.status(500).json({
      error: "Internal server error",
      message,
    });
  }
);

app.listen(PORT, () => {
  console.log("🌲 Bandipur Watch Nexus Backend");
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(
    `🌐 CORS enabled for: ${(CORS_ORIGINS.length ? CORS_ORIGINS : DEFAULT_ORIGINS).join(", ")}`
  );
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.log("⚠️  Supabase not configured - using mock data");
    console.log("📖 See SETUP.md for configuration instructions");
  } else {
    console.log("✅ Supabase configured");
  }
});
