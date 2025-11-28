import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl: string = process.env.SUPABASE_URL || "";
const supabaseKey: string = process.env.SUPABASE_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.warn("⚠️ Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_KEY in backend/.env");
  console.warn("📖 See SETUP.md for configuration instructions");
}

// Return a real client only when configured; otherwise null so routes can fall back to mock data
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
