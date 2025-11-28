import { Request, Response, NextFunction } from "express";
import { supabase } from "../db/supabaseClient.js";

type AuthedRequest = Request & { user?: unknown };

export async function checkAuth(req: Request, res: Response, next: NextFunction) {
  if (!supabase) {
    return res.status(503).json({
      error: "Authentication service not configured.",
    });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    (req as AuthedRequest).user = data.user;
    next();
  } catch (err) {
    console.error("Auth middleware failed:", err);
    res.status(500).json({ error: "Failed to verify token" });
  }
}
