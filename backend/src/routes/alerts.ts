import { Router, type Request, type Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase, isSupabaseConfigured } from "../db/supabaseClient.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../uploads");
const alertUploadsDir = path.join(uploadsRoot, "alerts");
fs.mkdirSync(alertUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, alertUploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

const toPublicPhotoUrl = (filename: string) => `/uploads/alerts/${filename}`;

// Mock alerts data
const mockAlerts = [
  {
    id: 1,
    alert_id: "ALT-001",
    device_id: "SEN-004",
    alert_type: "gunshot",
    severity: "High",
    location: { lat: 11.7089, lng: 76.5731, name: "Core Area Sector 7" },
    description: "Gunshot detected near elephant corridor",
    audio_url: "/api/audio/gunshot-001.wav",
    timestamp: "2024-01-15T14:23:45Z",
    resolved: false,
    created_at: "2024-01-15T14:23:45Z",
    photo_url: "/placeholder.svg"
  },
  {
    id: 2,
    alert_id: "ALT-002",
    device_id: "SEN-007",
    alert_type: "chainsaw",
    severity: "High",
    location: { lat: 11.6889, lng: 76.5431, name: "Buffer Zone Northeast" },
    description: "Chainsaw activity detected in protected area",
    audio_url: "/api/audio/chainsaw-002.wav",
    timestamp: "2024-01-15T13:45:12Z",
    resolved: false,
    created_at: "2024-01-15T13:45:12Z",
    photo_url: "/placeholder.svg"
  },
  {
    id: 3,
    alert_id: "ALT-003",
    device_id: "SEN-001",
    alert_type: "vehicle",
    severity: "Medium",
    location: { lat: 11.7189, lng: 76.5931, name: "Patrol Route Delta" },
    description: "Unauthorized vehicle movement after hours",
    audio_url: "/api/audio/vehicle-003.wav",
    timestamp: "2024-01-15T12:12:33Z",
    resolved: true,
    created_at: "2024-01-15T12:12:33Z",
    photo_url: "/placeholder.svg"
  },
  {
    id: 4,
    alert_id: "ALT-004",
    device_id: "SEN-012",
    alert_type: "animal_distress",
    severity: "Medium",
    location: { lat: 11.6989, lng: 76.5631, name: "Wildlife Corridor South" },
    description: "Animal distress calls detected",
    audio_url: "/api/audio/distress-004.wav",
    timestamp: "2024-01-15T11:34:56Z",
    resolved: false,
    created_at: "2024-01-15T11:34:56Z",
    photo_url: "/placeholder.svg"
  }
];

router.get("/", async (_req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      console.log("📊 Using mock alerts data - Supabase not configured");
      return res.json(mockAlerts);
    }

    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    res.json(data ?? []);
  } catch (err: any) {
    console.error("Database error, falling back to mock data:", err.message);
    res.json(mockAlerts);
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return res.status(503).json({ 
        error: "Database not configured. Please set up Supabase credentials." 
      });
    }

    const { 
      alert_id, 
      device_id, 
      alert_type, 
      severity, 
      location, 
      description, 
      audio_url,
      photo_url: incomingPhotoUrl
    } = req.body;
    
    const { data, error } = await supabase
      .from("alerts")
      .insert([{ 
        alert_id, 
        device_id, 
        alert_type, 
        severity, 
        location, 
        description, 
        audio_url,
        photo_url: incomingPhotoUrl
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

router.post("/respond", async (req: Request, res: Response) => {
  try {
    const { alert_id, action, timestamp, location, alert_type } = req.body;
    
    console.log(`🚨 Alert Response: ${action} for ${alert_type} at ${location} (${alert_id})`);
    
    // In a real application, you would:
    // 1. Update the alert status in the database
    // 2. Send notifications to response teams
    // 3. Log the response action
    // 4. Update analytics
    
    // For now, we'll just log and return success
    const response = {
      success: true,
      message: "Response team dispatched successfully",
      alert_id,
      action,
      timestamp,
      location,
      alert_type,
      response_id: `RESP-${Date.now()}`,
      estimated_arrival: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
    };
    
    res.json(response);
  } catch (err: any) {
    console.error("Error processing alert response:", err);
    res.status(500).json({ 
      success: false,
      error: err.message || "Failed to process alert response" 
    });
  }
});

router.post("/:alertId/photo", upload.single("photo"), async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;

    if (!alertId) {
      return res.status(400).json({ error: "Alert ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Photo file is required" });
    }

    const photoUrl = toPublicPhotoUrl(req.file.filename);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("alerts")
        .update({ photo_url: photoUrl })
        .eq("alert_id", alertId)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        success: true,
        photo_url: data?.photo_url ?? photoUrl,
      });
    }

    const mockIndex = mockAlerts.findIndex((alert) => alert.alert_id === alertId);
    if (mockIndex >= 0) {
      mockAlerts[mockIndex].photo_url = photoUrl;
    } else {
      mockAlerts.push({
        id: mockAlerts.length + 1,
        alert_id: alertId,
        device_id: "UNKNOWN",
        alert_type: "animal_distress",
        severity: "Low",
        location: { lat: 0, lng: 0, name: "Unknown Location" },
        description: "Photo received",
        audio_url: "",
        timestamp: new Date().toISOString(),
        resolved: false,
        created_at: new Date().toISOString(),
        photo_url: photoUrl,
      });
    }

    res.json({
      success: true,
      photo_url: photoUrl,
      mock: true,
    });
  } catch (err) {
    console.error("Error uploading alert photo:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to upload photo",
    });
  }
});

export default router;
