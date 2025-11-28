import { Router, type Request, type Response } from "express";
import { supabase, isSupabaseConfigured } from "../db/supabaseClient.js";

const router = Router();

type DeviceRecord = {
  id: number;
  device_id: string;
  name: string;
  location: { lat: number; lng: number; zone: string };
  status: "online" | "offline" | "maintenance";
  battery: number;
  signal_strength: number;
  connectivity: string;
  last_ping: string;
  alerts_count: number;
  uptime_percentage: number;
  created_at: string;
  updated_at: string;
};

// Mock data for when Supabase is not configured
const mockDevices: DeviceRecord[] = [
  {
    id: 1,
    device_id: "SEN-001",
    name: "Core Area Sector 7",
    location: { lat: 11.7089, lng: 76.5731, zone: "Core Protected Zone" },
    status: "online",
    battery: 85,
    signal_strength: 90,
    connectivity: "LoRa",
    last_ping: "2024-01-15T14:23:45Z",
    alerts_count: 3,
    uptime_percentage: 99.2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T14:23:45Z"
  },
  {
    id: 2,
    device_id: "SEN-004",
    name: "Buffer Zone Northeast",
    location: { lat: 11.6989, lng: 76.5631, zone: "Buffer Management Area" },
    status: "online",
    battery: 72,
    signal_strength: 85,
    connectivity: "GSM",
    last_ping: "2024-01-15T14:22:12Z",
    alerts_count: 0,
    uptime_percentage: 95.8,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T14:22:12Z"
  },
  {
    id: 3,
    device_id: "SEN-007",
    name: "Safari Route Checkpoint",
    location: { lat: 11.6889, lng: 76.5431, zone: "Tourist Safari Zone" },
    status: "offline",
    battery: 15,
    signal_strength: 0,
    connectivity: "LoRa",
    last_ping: "2024-01-14T09:45:33Z",
    alerts_count: 1,
    uptime_percentage: 67.3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-14T09:45:33Z"
  }
];

router.get("/", async (_req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      console.log("📊 Using mock data - Supabase not configured");
      return res.json(mockDevices);
    }

    const { data, error } = await supabase.from("devices").select("*");
    if (error) throw error;
    res.json(data ?? []);
  } catch (err: any) {
    console.error("Database error, falling back to mock data:", err.message);
    res.json(mockDevices);
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { device_id, name, location, connectivity = "LoRa" } = req.body as {
      device_id?: string;
      name?: string;
      location?: Partial<DeviceRecord["location"]>;
      connectivity?: string;
    };
    
    // Validate required fields
    if (!device_id || !name) {
      return res.status(400).json({ 
        error: "Device ID and name are required" 
      });
    }

    const normalizedDeviceId = String(device_id).trim();
    const normalizedName = String(name).trim();

    if (!normalizedDeviceId || !normalizedName) {
      return res.status(400).json({
        error: "Device ID and name cannot be empty",
      });
    }

    if (!isSupabaseConfigured || !supabase) {
      const fallbackLocation: DeviceRecord["location"] =
        location && typeof location === "object"
          ? {
              lat: Number(location.lat ?? 11.7),
              lng: Number(location.lng ?? 76.58),
              zone: String(location.zone ?? "New Device Zone"),
            }
          : { lat: 11.7, lng: 76.58, zone: "New Device Zone" };

      // Simulate adding device to mock data
      const newDevice: DeviceRecord = {
        id: mockDevices.length + 1,
        device_id: normalizedDeviceId,
        name: normalizedName,
        location: fallbackLocation,
        status: "online",
        battery: 100,
        signal_strength: 95,
        connectivity: String(connectivity ?? "LoRa"),
        last_ping: new Date().toISOString(),
        alerts_count: 0,
        uptime_percentage: 100.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockDevices.push(newDevice);
      console.log(`📱 Added new device: ${normalizedDeviceId} - ${normalizedName}`);
      
      return res.status(201).json([newDevice]);
    }

    const { data, error } = await supabase
      .from("devices")
      .insert([{ 
        device_id: normalizedDeviceId, 
        name: normalizedName, 
        status: "online",
        location: location || { lat: 11.7000, lng: 76.5800, zone: "New Device Zone" },
        battery: 100,
        signal_strength: 95,
        connectivity,
        last_ping: new Date().toISOString(),
        alerts_count: 0,
        uptime_percentage: 100.0
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    console.error("Error adding device:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

// Update device settings
router.put("/:id/settings", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ping_interval, battery_threshold, connectivity } = req.body;
    
    if (!isSupabaseConfigured || !supabase) {
      console.log(`⚙️ Updated device ${id} settings:`, { ping_interval, battery_threshold, connectivity });
      return res.json({ 
        message: "Device settings updated successfully",
        settings: { ping_interval, battery_threshold, connectivity }
      });
    }

    const { data, error } = await supabase
      .from("device_settings")
      .upsert({ 
        device_id: id,
        ping_interval,
        battery_threshold,
        connectivity,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("Error updating device settings:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

// Get device health status
router.get("/health", async (_req: Request, res: Response) => {
  try {
    let devicesData: DeviceRecord[] = mockDevices;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("devices").select("*");
      if (error) {
        console.warn("Failed to fetch device health data, falling back to mock:", error.message);
      } else if (Array.isArray(data) && data.length) {
        devicesData = data as DeviceRecord[];
      }
    }

    const totalCount = devicesData.length || 1;
    const onlineCount = devicesData.filter((d) => d.status === "online").length;
    const avgBattery = devicesData.reduce((sum, d) => sum + d.battery, 0) / totalCount;
    const avgUptime = devicesData.reduce((sum, d) => sum + d.uptime_percentage, 0) / totalCount;

    res.json({
      total_devices: totalCount,
      online_devices: onlineCount,
      offline_devices: totalCount - onlineCount,
      average_battery: Math.round(avgBattery),
      average_uptime: Math.round(avgUptime * 100) / 100,
      last_updated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Error getting device health:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

export default router;
