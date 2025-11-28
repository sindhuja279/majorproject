import { Router, type Request, type Response } from "express";
import { supabase } from "../db/supabaseClient.js";

const router = Router();

// Mock analytics data
const mockAnalytics = {
  weeklyAlerts: [
    { day: "Mon", gunshots: 2, chainsaws: 1, vehicles: 3, total: 6 },
    { day: "Tue", gunshots: 0, chainsaws: 0, vehicles: 1, total: 1 },
    { day: "Wed", gunshots: 1, chainsaws: 2, vehicles: 2, total: 5 },
    { day: "Thu", gunshots: 3, chainsaws: 0, vehicles: 1, total: 4 },
    { day: "Fri", gunshots: 1, chainsaws: 1, vehicles: 4, total: 6 },
    { day: "Sat", gunshots: 2, chainsaws: 3, vehicles: 2, total: 7 },
    { day: "Sun", gunshots: 0, chainsaws: 1, vehicles: 1, total: 2 }
  ],
  monthlyTrend: [
    { month: "Jan", alerts: 45, incidents: 12 },
    { month: "Feb", alerts: 38, incidents: 8 },
    { month: "Mar", alerts: 52, incidents: 15 },
    { month: "Apr", alerts: 41, incidents: 10 },
    { month: "May", alerts: 47, incidents: 13 },
    { month: "Jun", alerts: 35, incidents: 7 }
  ],
  alertTypes: [
    { name: "Vehicle Movement", value: 45, color: "#8B5CF6" },
    { name: "Gunshots", value: 28, color: "#EF4444" },
    { name: "Chainsaw Activity", value: 18, color: "#F59E0B" },
    { name: "Animal Distress", value: 9, color: "#10B981" }
  ],
  summary: {
    totalAlerts: 31,
    avgDailyAlerts: 4.4,
    peakDay: "Sat",
    responseRate: 94,
    onlineDevices: 4,
    totalDevices: 6,
    networkHealth: 67
  }
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    if (!supabase) {
      console.log("📊 Using mock analytics data - Supabase not configured");
      return res.json(mockAnalytics);
    }

    // Query real analytics data from database
    const [weeklyData, monthlyData, alertTypesData, summaryData] = await Promise.all([
      supabase.from("analytics").select("*").gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("analytics").select("*").order("date", { ascending: true }),
      supabase.from("alerts").select("alert_type").gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("devices").select("status")
    ]);

    // Process and return real data
    res.json({
      weeklyAlerts: weeklyData.data || mockAnalytics.weeklyAlerts,
      monthlyTrend: monthlyData.data || mockAnalytics.monthlyTrend,
      alertTypes: alertTypesData.data || mockAnalytics.alertTypes,
      summary: summaryData.data || mockAnalytics.summary
    });
  } catch (err: any) {
    console.error("Database error, falling back to mock data:", err.message);
    res.json(mockAnalytics);
  }
});

router.get("/summary", async (_req: Request, res: Response) => {
  try {
    if (!supabase) {
      console.log("📊 Using mock analytics summary - Supabase not configured");
      return res.json(mockAnalytics.summary);
    }

    const { data, error } = await supabase
      .rpc("get_analytics_summary")
      .select();
    
    if (error) throw error;
    res.json(data || mockAnalytics.summary);
  } catch (err: any) {
    console.error("Database error, falling back to mock data:", err.message);
    res.json(mockAnalytics.summary);
  }
});

export default router;
