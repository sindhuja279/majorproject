// backend/testSupabase.ts — diagnostic version
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

console.log(">>> testSupabase START");
console.log("Working directory:", process.cwd());
console.log("Node version:", process.version);

// Check env values presence (DON'T paste key publicly)
console.log("SUPABASE_URL present?:", !!process.env.SUPABASE_URL);
console.log("SUPABASE_KEY present?:", !!process.env.SUPABASE_KEY);
console.log("PORT:", process.env.PORT ?? "(not set)");

async function run() {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env — check backend/.env");
      process.exit(1);
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    console.log("Attempting a test query to table `devices` (limit 1)...");
    const { data, error } = await supabase.from("devices").select("*").limit(1);

    if (error) {
      console.error("Supabase returned error:", error);
      process.exit(1);
    }

    console.log("Supabase OK — sample data:", data);
    console.log(">>> testSupabase END (success)");
    process.exit(0);
  } catch (err: any) {
    console.error("Unhandled error:", err && err.message ? err.message : err);
    process.exit(1);
  }
}

// Run and ensure node waits for it
run();
