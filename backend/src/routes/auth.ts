import { Router, type Request, type Response } from "express";
import { supabase } from "../db/supabaseClient.js";

const router = Router();

router.get("/me", async (req: Request, res: Response) => {
  if (!supabase) {
    return res.status(503).json({ error: "Authentication service not configured" });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: error.message });

  res.json({ user: data.user });
});

export default router;
